<?php

declare(strict_types=1);

spl_autoload_register(function (string $class): void {
    $baseDir = __DIR__ . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR;

    $map = [
        'Model\\media\\Media'              => $baseDir . 'Model' . DIRECTORY_SEPARATOR . 'media.php',
        'Model\\film\\Film'                => $baseDir . 'Model' . DIRECTORY_SEPARATOR . 'film.php',
        'Services\\PlayEngine\\PlayEngine' => $baseDir . 'Services' . DIRECTORY_SEPARATOR . 'PlayEngine.php',
    ];

    if (isset($map[$class]) && file_exists($map[$class])) {
        require_once $map[$class];
        return;
    }

    $file = $baseDir . str_replace('\\', DIRECTORY_SEPARATOR, $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

use Model\media\Media;
use Model\film\Film;
use Services\PlayEngine\PlayEngine;

function getEngineLibrary(PlayEngine $engine): array
{
    $extractor = \Closure::bind(function () {
        return $this->library;
    }, $engine, PlayEngine::class);

    return $extractor();
}

function updateMediaInEngine(PlayEngine &$engine, int $indexToUpdate, Film $updatedFilm): bool
{
    $items = getEngineLibrary($engine);
    if (!isset($items[$indexToUpdate])) {
        return false;
    }

    $items[$indexToUpdate] = $updatedFilm;

    $newEngine = new PlayEngine();
    foreach ($items as $item) {
        $newEngine->addMedia($item);
    }
    $engine = $newEngine;
    return true;
}

function deleteMediaFromEngine(PlayEngine &$engine, int $indexToDelete): bool
{
    $items = getEngineLibrary($engine);
    if (!isset($items[$indexToDelete])) {
        return false;
    }

    unset($items[$indexToDelete]);
    $items = array_values($items);

    $newEngine = new PlayEngine();
    foreach ($items as $item) {
        $newEngine->addMedia($item);
    }
    $engine = $newEngine;
    return true;
}

function prompt(string $label): string
{
    echo $label;
    $line = fgets(STDIN);
    return $line !== false ? trim($line) : '';
}

function promptWithDefault(string $label, string $default): string
{
    echo "{$label} [Tekan Enter untuk tetap '{$default}']: ";
    $line = fgets(STDIN);
    $trimmed = $line !== false ? trim($line) : '';
    return $trimmed !== '' ? $trimmed : $default;
}

function printHeader(string $title): void
{
    echo PHP_EOL . str_repeat('=', 70) . PHP_EOL;
    echo "  " . strtoupper($title) . PHP_EOL;
    echo str_repeat('=', 70) . PHP_EOL;
}

function printDivider(): void
{
    echo str_repeat('-', 70) . PHP_EOL;
}

$engine = new PlayEngine();

$engine->addMedia(new Film("Inception", 148, 8.8, "Sci-Fi"));
$engine->addMedia(new Film("Interstellar", 169, 8.7, "Sci-Fi"));
$engine->addMedia(new Film("Spirited Away", 125, 8.6, "Animation"));
$engine->addMedia(new Film("The Dark Knight", 152, 9.0, "Action"));

while (true) {
    printHeader("FLIPPLAY BACKEND ENGINE - SIMULASI CRUD TERMINAL");
    echo "  [1] Tambah Film Baru (Create)" . PHP_EOL;
    echo "  [2] Lihat Semua Film & Total Durasi (Read All)" . PHP_EOL;
    echo "  [3] Putar Semua Film (Play All)" . PHP_EOL;
    echo "  [4] Filter Film Berdasarkan Genre (Read Filter)" . PHP_EOL;
    echo "  [5] Ubah Data Film (Update)" . PHP_EOL;
    echo "  [6] Hapus Film (Delete)" . PHP_EOL;
    echo "  [0] Keluar dari Program" . PHP_EOL;
    printDivider();

    $pilihan = prompt("Pilih Menu [0-6]: ");

    switch ($pilihan) {
        case '1':
            printHeader("MENU 1: TAMBAH FILM BARU (CREATE)");

            $title = prompt("Masukkan Judul Film: ");
            if ($title === '') {
                echo "[!] Gagal: Judul film tidak boleh kosong!" . PHP_EOL;
                break;
            }

            $durationInput = prompt("Masukkan Durasi (menit): ");
            $duration = (int) $durationInput;
            if ($duration <= 0) {
                echo "[!] Gagal: Durasi harus berupa angka lebih dari 0!" . PHP_EOL;
                break;
            }

            $ratingInput = prompt("Masukkan Rating (0.0 - 10.0): ");
            $rating = (float) $ratingInput;
            if ($rating < 0.0 || $rating > 10.0) {
                echo "[!] Gagal: Rating harus berada di antara 0.0 sampai 10.0!" . PHP_EOL;
                break;
            }

            $genre = prompt("Masukkan Genre Film (misal: Action, Sci-Fi, Drama): ");
            if ($genre === '') {
                $genre = 'General';
            }

            try {
                $filmBaru = new Film($title, $duration, $rating, $genre);

                $engine->addMedia($filmBaru);

                echo PHP_EOL . "[V] SUKSES: Film '{$title}' berhasil ditambahkan ke dalam PlayEngine!" . PHP_EOL;
                echo "    Info: " . $filmBaru->getInfo() . PHP_EOL;
            } catch (\Exception $e) {
                echo "[!] Terjadi Kesalahan: " . $e->getMessage() . PHP_EOL;
            }
            break;

        case '2':
            printHeader("MENU 2: DAFTAR SEMUA FILM & STATISTIK (READ)");
            $library = getEngineLibrary($engine);

            if (empty($library)) {
                echo "[i] Belum ada film di dalam engine." . PHP_EOL;
            } else {
                printf("  %-4s | %-25s | %-12s | %-8s | %-12s\n", "No", "Judul", "Durasi", "Rating", "Genre");
                printDivider();

                foreach ($library as $index => $media) {
                    $genre = ($media instanceof Film) ? $media->getGenre() : '-';
                    $rating = ($media instanceof Film) ? sprintf("%.1f", $media->getRating()) : '-';

                    printf(
                        "  [%02d] | %-25s | %4d menit   | ★ %-6s | %-12s\n",
                        $index + 1,
                        (strlen($media->getTitle()) > 25 ? substr($media->getTitle(), 0, 22) . '...' : $media->getTitle()),
                        $media->getDuration(),
                        $rating,
                        $genre
                    );
                }

                printDivider();
                $totalMenit = $engine->totalDuration();
                $jam = floor($totalMenit / 60);
                $sisaMenit = $totalMenit % 60;

                echo "  Total Film Tersimpan : " . count($library) . " film" . PHP_EOL;
                echo "  Total Durasi Library : {$totalMenit} menit ({$jam} jam {$sisaMenit} menit) via totalDuration()" . PHP_EOL;
            }
            break;

        case '3':
            printHeader("MENU 3: PUTAR SEMUA FILM (PLAY ALL)");
            $library = getEngineLibrary($engine);

            if (empty($library)) {
                echo "[i] Tidak ada film untuk diputar. Library kosong." . PHP_EOL;
            } else {
                echo "[*] Menjalankan method bawaan: PlayEngine::playAll()..." . PHP_EOL . PHP_EOL;
                $engine->playAll();

                foreach ($library as $index => $media) {
                    echo "  " . ($index + 1) . ". " . $media->play() . PHP_EOL;
                }
                echo PHP_EOL . "[V] Semua film berhasil diputar!" . PHP_EOL;
            }
            break;

        case '4':
            printHeader("MENU 4: FILTER FILM BERDASARKAN GENRE");
            $genreCari = prompt("Masukkan Genre yang Ingin Dicari: ");

            if ($genreCari === '') {
                echo "[!] Genre tidak boleh kosong." . PHP_EOL;
                break;
            }

            $hasilFilter = $engine->filterByGenre($genreCari);

            echo PHP_EOL . "[*] Hasil Pencarian untuk Genre '{$genreCari}':" . PHP_EOL;
            if (empty($hasilFilter)) {
                echo "    (Tidak ditemukan film dengan genre '{$genreCari}')" . PHP_EOL;
            } else {
                printf("  %-4s | %-25s | %-12s | %-8s | %-12s\n", "No", "Judul", "Durasi", "Rating", "Genre");
                printDivider();

                foreach ($hasilFilter as $idx => $film) {
                    printf(
                        "  [%02d] | %-25s | %4d menit   | ★ %-6.1f | %-12s\n",
                        $idx + 1,
                        (strlen($film->getTitle()) > 25 ? substr($film->getTitle(), 0, 22) . '...' : $film->getTitle()),
                        $film->getDuration(),
                        $film->getRating(),
                        $film->getGenre()
                    );
                }
                echo PHP_EOL . "  Ditemukan " . count($hasilFilter) . " film dengan genre '{$genreCari}'." . PHP_EOL;
            }
            break;

        case '5':
            printHeader("MENU 5: UBAH DATA FILM (UPDATE)");
            $library = getEngineLibrary($engine);

            if (empty($library)) {
                echo "[i] Belum ada film yang dapat diubah." . PHP_EOL;
                break;
            }

            foreach ($library as $idx => $m) {
                echo "  [" . ($idx + 1) . "] " . $m->getInfo() . PHP_EOL;
            }
            printDivider();

            $pilihNomor = (int) prompt("Pilih nomor film yang ingin diubah (1-" . count($library) . "): ");
            $targetIndex = $pilihNomor - 1;

            if (!isset($library[$targetIndex])) {
                echo "[!] Nomor film tidak valid!" . PHP_EOL;
                break;
            }

            $currentFilm = $library[$targetIndex];
            if (!($currentFilm instanceof Film)) {
                echo "[!] Media bukan instance dari Film." . PHP_EOL;
                break;
            }

            echo PHP_EOL . "[*] Mengubah data untuk film: '{$currentFilm->getTitle()}'" . PHP_EOL;
            $newTitle = promptWithDefault("Judul Baru", $currentFilm->getTitle());

            $newDurationStr = promptWithDefault("Durasi Baru (menit)", (string) $currentFilm->getDuration());
            $newDuration = (int) $newDurationStr;
            if ($newDuration <= 0) {
                echo "[!] Durasi tidak valid. Perubahan dibatalkan." . PHP_EOL;
                break;
            }

            $newRatingStr = promptWithDefault("Rating Baru (0.0 - 10.0)", (string) $currentFilm->getRating());
            $newRating = (float) $newRatingStr;
            if ($newRating < 0.0 || $newRating > 10.0) {
                echo "[!] Rating tidak valid. Perubahan dibatalkan." . PHP_EOL;
                break;
            }

            $newGenre = promptWithDefault("Genre Baru", $currentFilm->getGenre());

            $updatedFilm = new Film($newTitle, $newDuration, $newRating, $newGenre);

            if (updateMediaInEngine($engine, $targetIndex, $updatedFilm)) {
                echo PHP_EOL . "[V] SUKSES: Data film berhasil diperbarui!" . PHP_EOL;
                echo "    Data Baru: " . $updatedFilm->getInfo() . PHP_EOL;
            } else {
                echo "[!] Gagal memperbarui film." . PHP_EOL;
            }
            break;

        case '6':
            printHeader("MENU 6: HAPUS FILM (DELETE)");
            $library = getEngineLibrary($engine);

            if (empty($library)) {
                echo "[i] Belum ada film yang dapat dihapus." . PHP_EOL;
                break;
            }

            foreach ($library as $idx => $m) {
                echo "  [" . ($idx + 1) . "] " . $m->getInfo() . PHP_EOL;
            }
            printDivider();

            $pilihNomor = (int) prompt("Pilih nomor film yang ingin dihapus (1-" . count($library) . "): ");
            $targetIndex = $pilihNomor - 1;

            if (!isset($library[$targetIndex])) {
                echo "[!] Nomor film tidak valid!" . PHP_EOL;
                break;
            }

            $filmHapus = $library[$targetIndex];
            $konfirmasi = prompt("Apakah Anda yakin ingin menghapus '{$filmHapus->getTitle()}'? (y/n): ");

            if (strtolower($konfirmasi) === 'y') {
                if (deleteMediaFromEngine($engine, $targetIndex)) {
                    echo PHP_EOL . "[V] SUKSES: Film '{$filmHapus->getTitle()}' berhasil dihapus dari PlayEngine!" . PHP_EOL;
                } else {
                    echo "[!] Gagal menghapus film." . PHP_EOL;
                }
            } else {
                echo "[*] Penghapusan dibatalkan." . PHP_EOL;
            }
            break;

        case '0':
            echo PHP_EOL . "[*] Terima kasih telah menggunakan FlipPlay Engine Simulator. Sampai jumpa!" . PHP_EOL;
            exit(0);

        default:
            echo PHP_EOL . "[!] Pilihan menu '{$pilihan}' tidak dikenali. Silakan masukkan angka 0-6." . PHP_EOL;
            break;
    }

    echo PHP_EOL;
    prompt("Tekan Enter untuk kembali ke menu utama...");
}
