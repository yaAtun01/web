(function () {
    'use strict';

    const STATE = {
        rawData: [],          // Raw media items from the API
        filteredData: [],     // Media items matching current search, aura, and format filters
        currentAura: 'all',   // Active Aura filter ('all', 'high-energy', 'melancholy', etc.)
        searchQuery: '',      // Current search keyword
        currentType: 'all',   // Active format filter ('all', 'TV', 'Movie')
        sortBy: 'score-desc', // Current sorting criterion
        isLoading: true,      // Loading state indicator
        error: null,          // Error message if fetch fails
        watchlist: JSON.parse(localStorage.getItem('flipplay_watchlist') || '[]'),
        simulateErrorMode: false // Developer / Evaluator testing toggle
    };

    const API_URL = 'https://kitsu.io/api/edge/anime?page%5Blimit%5D=20&sort=-averageRating';

    function normalizeKitsuAnime(item) {
        const attributes = item.attributes || {};
        const titles = attributes.titles || {};
        const rating = attributes.averageRating == null ? 0 : Number(attributes.averageRating);
        const posterUrl = attributes.posterImage?.large || attributes.posterImage?.medium || '';
        const statusLabels = {
            current: 'Currently Airing',
            finished: 'Finished Airing',
            upcoming: 'Not yet aired'
        };

        return {
            mal_id: Number(item.id) || item.id,
            title: attributes.canonicalTitle || titles.en_jp || titles.en || 'Untitled anime',
            title_english: titles.en || attributes.canonicalTitle || '',
            title_japanese: titles.ja_jp || titles.en_jp || '',
            type: (attributes.subtype || '').toLowerCase() === 'movie' ? 'Movie' : 'TV',
            episodes: attributes.episodeCount || 0,
            score: Number.isFinite(rating) ? rating / 10 : 0,
            rank: Number(attributes.ratingRank) || 0,
            popularity: Number(attributes.popularityRank) || 0,
            status: statusLabels[attributes.status] || attributes.status || 'Unknown',
            year: attributes.startDate ? Number(attributes.startDate.slice(0, 4)) : 0,
            synopsis: attributes.synopsis || attributes.description || '',
            images: {
                webp: { large_image_url: posterUrl },
                jpg: { large_image_url: posterUrl }
            },
            genres: [],
            studios: [],
            url: `https://kitsu.io/anime/${encodeURIComponent(attributes.slug || item.id)}`
        };
    }

    function determineAura(anime) {
        if (anime.aura) return anime.aura;
        const genres = (anime.genres || []).map(g => (g.name || '').toLowerCase());
        
        if (genres.some(g => ['action', 'sports', 'shounen', 'adventure'].includes(g))) {
            return 'high-energy';
        }
        if (genres.some(g => ['drama', 'romance', 'supernatural', 'slice of life'].includes(g))) {
            return 'melancholy';
        }
        if (genres.some(g => ['suspense', 'mystery', 'thriller', 'horror'].includes(g))) {
            return 'binge';
        }
        if (genres.some(g => ['comedy', 'gourmet', 'iyashikei'].includes(g))) {
            return 'cozy';
        }
        if (genres.some(g => ['sci-fi', 'psychological', 'space'].includes(g))) {
            return 'mind-bender';
        }
        return 'high-energy';
    }

    const AURA_CONFIG = {
        'high-energy': {
            label: 'High Energy',
            icon: '⚡',
            badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
        },
        'melancholy': {
            label: 'Melancholy',
            icon: '🌧️',
            badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        },
        'binge': {
            label: 'Binge Mode',
            icon: '🍿',
            badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        },
        'cozy': {
            label: 'Cozy Chill',
            icon: '🌸',
            badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
        },
        'mind-bender': {
            label: 'Mind-Bender',
            icon: '🔮',
            badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        }
    };

    let gridContainer, searchInput, searchClearBtn, filterTypeSelect, sortBySelect, btnRefresh, btnSimulateError, auraButtons, resultCountEl, statTotalEl, statAvgEl, statWatchlistEl, statSourceEl, modalOverlay, modalContent, modalBody, modalCloseBtn;

    function initElements() {
        gridContainer = document.getElementById('vibe-grid-container');
        searchInput = document.getElementById('vibe-search-input');
        searchClearBtn = document.getElementById('vibe-search-clear');
        filterTypeSelect = document.getElementById('vibe-filter-type');
        sortBySelect = document.getElementById('vibe-sort-by');
        btnRefresh = document.getElementById('vibe-btn-refresh');
        btnSimulateError = document.getElementById('vibe-btn-simulate-error');
        auraButtons = document.querySelectorAll('.aura-pill');
        resultCountEl = document.getElementById('vibe-result-count');
        statTotalEl = document.getElementById('vibe-stat-total');
        statAvgEl = document.getElementById('vibe-stat-avg');
        statWatchlistEl = document.getElementById('vibe-stat-watchlist');
        statSourceEl = document.getElementById('vibe-stat-source');
        modalOverlay = document.getElementById('vibe-modal-overlay');
        modalContent = document.getElementById('vibe-modal-content');
        modalBody = document.getElementById('vibe-modal-body');
        modalCloseBtn = document.getElementById('vibe-modal-close');
    }
   
    async function fetchVibeData() {
        STATE.isLoading = true;
        STATE.error = null;
        renderLoadingState();
        updateStats();

        if (STATE.simulateErrorMode) {
            setTimeout(() => {
                STATE.isLoading = false;
                STATE.error = 'Simulasi error API [HTTP 429: Too Many Requests / Rate Limit Reached]. Silakan coba lagi.';
                renderErrorState();
            }, 600);
            return;
        }

        try {
            if (statSourceEl) statSourceEl.textContent = 'Menghubungkan API...';
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const response = await fetch(API_URL, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API Response status: ${response.status} ${response.statusText}`);
            }

            const json = await response.json();
            if (!json || !Array.isArray(json.data) || json.data.length === 0) {
                throw new Error('Data API kosong atau struktur respon tidak sesuai.');
            }

            const enrichedData = json.data.map(item => {
                const anime = normalizeKitsuAnime(item);
                return { ...anime, aura: determineAura(anime) };
            });

            applyMediaData(enrichedData, 'Live REST API');
        } catch (err) {
            console.error('[FlipPlay] Live API fetch failed:', err);
            STATE.isLoading = false;
            STATE.error = err instanceof Error
                ? `Gagal memuat data API: ${err.message}`
                : 'Gagal memuat data API karena terjadi kesalahan yang tidak diketahui.';
            renderErrorState();
        }
    }

    function applyMediaData(data, sourceLabel) {
        STATE.rawData = data;
        STATE.isLoading = false;
        STATE.error = null;
        if (statSourceEl) {
            statSourceEl.textContent = sourceLabel;
            statSourceEl.className = sourceLabel.includes('Live') 
                ? 'font-bold text-emerald-400' 
                : 'font-bold text-amber-400';
        }
        applyFiltersAndRender();
    }

    function renderLoadingState() {
        if (!gridContainer) return;
        const skeletons = Array(8).fill(0).map(() => `
            <div class="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between animate-pulse">
                <div class="h-64 skeleton-shimmer w-full relative"></div>
                <div class="p-5 space-y-3">
                    <div class="h-3.5 bg-white/10 rounded w-1/3 skeleton-shimmer"></div>
                    <div class="h-5 bg-white/10 rounded w-4/5 skeleton-shimmer"></div>
                    <div class="h-3 bg-white/5 rounded w-full skeleton-shimmer"></div>
                    <div class="h-3 bg-white/5 rounded w-2/3 skeleton-shimmer"></div>
                </div>
                <div class="p-5 pt-0 flex justify-between items-center">
                    <div class="h-8 bg-white/10 rounded-lg w-24 skeleton-shimmer"></div>
                    <div class="h-8 w-8 bg-white/10 rounded-full skeleton-shimmer"></div>
                </div>
            </div>
        `).join('');

        gridContainer.innerHTML = skeletons;
        if (resultCountEl) resultCountEl.textContent = 'Sedang memuat data dari API publik ...';
    }

    function renderErrorState() {
        if (!gridContainer) return;
        gridContainer.innerHTML = `
            <div class="col-span-full py-16 px-6 text-center glass-card border border-red-500/40 rounded-3xl bg-red-950/20">
                <div class="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto text-2xl mb-4">
                    ⚠️
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Gagal Mengambil Data dari API Publik</h3>
                <p class="text-sm text-gray-300 max-w-lg mx-auto mb-6 leading-relaxed">
                    ${escapeHtml(STATE.error || 'Terjadi gangguan jaringan atau batasan rate limit pada server API. Silakan coba lagi.')}
                </p>
                <div class="flex flex-wrap items-center justify-center gap-3">
                    <button id="vibe-retry-btn" type="button" class="px-5 py-2.5 rounded-full bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition-all shadow-lg shadow-brand-pink/30 flex items-center gap-1.5">
                        <span>🔄</span> Coba Lagi (Re-fetch)
                    </button>
                </div>
            </div>
        `;

        if (resultCountEl) resultCountEl.textContent = 'Gagal memuat data.';
        if (statSourceEl) {
            statSourceEl.textContent = 'Koneksi API Terputus';
            statSourceEl.className = 'font-bold text-red-400';
        }

        // Attach retry handlers
        const retryBtn = document.getElementById('vibe-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                STATE.simulateErrorMode = false;
                fetchVibeData();
            });
        }
    }

    function applyFiltersAndRender() {
        if (!STATE.rawData || STATE.rawData.length === 0) return;

        let result = STATE.rawData.filter(anime => {
            const query = STATE.searchQuery.toLowerCase().trim();
            const title = (anime.title || '').toLowerCase();
            const titleEng = (anime.title_english || '').toLowerCase();
            const titleJap = (anime.title_japanese || '').toLowerCase();
            const matchSearch = !query || title.includes(query) || titleEng.includes(query) || titleJap.includes(query);

            const matchAura = STATE.currentAura === 'all' || anime.aura === STATE.currentAura;

            const matchType = STATE.currentType === 'all' || anime.type === STATE.currentType;

            return matchSearch && matchAura && matchType;
        });

        result.sort((a, b) => {
            if (STATE.sortBy === 'score-desc') return (b.score || 0) - (a.score || 0);
            if (STATE.sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
            if (STATE.sortBy === 'episodes-desc') return (b.episodes || 0) - (a.episodes || 0);
            if (STATE.sortBy === 'popularity-asc') return (a.popularity || 999999) - (b.popularity || 999999);
            return 0;
        });

        STATE.filteredData = result;

        // Render Cards to DOM
        renderMediaCards(result);

        // Update Statistics via reduce()
        updateStats();
    }

    // Array Method: reduce() - compute average rating score dynamically
    function updateStats() {
        if (statTotalEl) statTotalEl.textContent = STATE.rawData.length;
        if (statWatchlistEl) statWatchlistEl.textContent = STATE.watchlist.length;

        if (statAvgEl) {
            const dataToCalc = STATE.filteredData.length > 0 ? STATE.filteredData : STATE.rawData;
            if (dataToCalc.length > 0) {
                // Using reduce() to calculate average score
                const totalScore = dataToCalc.reduce((accumulator, item) => {
                    return accumulator + (Number(item.score) || 0);
                }, 0);
                const avg = (totalScore / dataToCalc.length).toFixed(2);
                statAvgEl.textContent = `⭐ ${avg}`;
            } else {
                statAvgEl.textContent = '--';
            }
        }
    }

    function renderMediaCards(items) {
        if (!gridContainer) return;

        if (items.length === 0) {
            gridContainer.innerHTML = `
                <div class="col-span-full py-16 text-center glass-card rounded-3xl border border-white/10 p-8">
                    <span class="text-4xl block mb-3">🔍</span>
                    <h3 class="text-lg font-bold text-white">Tidak ada media yang cocok</h3>
                    <p class="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                        Tidak ditemukan judul atau aura dengan kata kunci "<strong>${escapeHtml(STATE.searchQuery)}</strong>". Coba kata kunci lain atau pilih "Semua Vibes".
                    </p>
                    <button id="vibe-reset-filter-btn" type="button" class="mt-4 px-4 py-2 rounded-full bg-brand-pink text-white text-xs font-semibold hover:bg-brand-pink-dark transition-colors">
                        Reset Semua Filter
                    </button>
                </div>
            `;

            const resetBtn = document.getElementById('vibe-reset-filter-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    STATE.searchQuery = '';
                    STATE.currentAura = 'all';
                    STATE.currentType = 'all';
                    if (searchInput) searchInput.value = '';
                    if (searchClearBtn) searchClearBtn.classList.add('hidden');
                    if (filterTypeSelect) filterTypeSelect.value = 'all';
                    auraButtons.forEach(btn => {
                        if (btn.getAttribute('data-aura') === 'all') btn.classList.add('active');
                        else btn.classList.remove('active');
                    });
                    applyFiltersAndRender();
                });
            }

            if (resultCountEl) resultCountEl.textContent = '0 judul ditemukan';
            return;
        }

        // Array Method: map() - transform items into card template literals
        const cardsHtml = items.map(anime => {
            const auraInfo = AURA_CONFIG[anime.aura] || AURA_CONFIG['high-energy'];
            const posterUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || 'https://via.placeholder.com/300x420?text=No+Poster';
            const titleDisplay = anime.title_english || anime.title;
            const episodeText = anime.episodes ? `${anime.episodes} Ep` : (anime.status === 'Currently Airing' ? 'Ongoing' : 'Movie');
            const genreBadges = (anime.genres || []).slice(0, 2).map(g => `<span class="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 border border-white/5">${g.name}</span>`).join(' ');
            const isBookmarked = STATE.watchlist.includes(anime.mal_id);
            const scoreDisplay = anime.score ? anime.score.toFixed(2) : 'N/A';

            return `
                <article class="vibe-card glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group shadow-lg" data-mal-id="${anime.mal_id}">
                    <div>
                        <!-- Poster Container -->
                        <div class="h-64 relative overflow-hidden bg-slate-950">
                            <img 
                                src="${posterUrl}" 
                                alt="${escapeHtml(titleDisplay)}" 
                                class="vibe-card-poster w-full h-full object-cover"
                                loading="lazy"
                                onerror="this.src='https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60';"
                            >
                            <div class="absolute inset-0 bg-gradient-to-t from-brand-dark-card via-black/20 to-transparent"></div>

                            <!-- Top Badges: Aura & Score -->
                            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                                <span class="aura-tag px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${auraInfo.badgeClass} backdrop-blur-md flex items-center gap-1 shadow-sm">
                                    <span>${auraInfo.icon}</span>
                                    <span>${auraInfo.label}</span>
                                </span>
                            </div>

                            <div class="absolute top-3 right-3">
                                <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-black/70 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-sm">
                                    ⭐ ${scoreDisplay}
                                </span>
                            </div>

                            <!-- Bottom Poster Type / Ep Pills -->
                            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                                <span class="bg-brand-pink/90 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase tracking-wider">
                                    ${anime.type || 'Anime'}
                                </span>
                                <span class="bg-black/60 px-2 py-0.5 rounded text-[11px] backdrop-blur-sm text-gray-300">
                                    ${episodeText}
                                </span>
                            </div>
                        </div>

                        <!-- Card Body -->
                        <div class="p-5 space-y-2.5">
                            <div class="flex flex-wrap gap-1">
                                ${genreBadges}
                            </div>
                            <h3 class="text-sm font-bold text-white group-hover:text-brand-pink transition-colors line-clamp-1" title="${escapeHtml(titleDisplay)}">
                                ${escapeHtml(titleDisplay)}
                            </h3>
                            <p class="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                                ${anime.synopsis ? escapeHtml(anime.synopsis) : 'Sinopsis resmi belum tersedia untuk judul ini.'}
                            </p>
                        </div>
                    </div>

                    <!-- Card Actions -->
                    <div class="p-5 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                        <button type="button" class="vibe-detail-btn px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-brand-pink text-white text-xs font-semibold transition-all flex items-center gap-1" data-id="${anime.mal_id}">
                            <span>Detail</span>
                            <span>&rarr;</span>
                        </button>
                        
                        <button type="button" class="vibe-bookmark-btn w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${isBookmarked ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10'}" data-id="${anime.mal_id}" title="${isBookmarked ? 'Hapus dari Watchlist' : 'Simpan ke Watchlist'}">
                            <span>${isBookmarked ? '★' : '☆'}</span>
                        </button>
                    </div>
                </article>
            `;
        }).join('');

        gridContainer.innerHTML = cardsHtml;

        // Update result text
        if (resultCountEl) {
            const auraLabel = STATE.currentAura === 'all' ? 'Semua Vibes' : AURA_CONFIG[STATE.currentAura]?.label;
            resultCountEl.textContent = `Menampilkan ${items.length} media • Mood: ${auraLabel}`;
        }

        // Bind events on newly rendered card buttons
        attachCardListeners();
    }

    // 6. EVENT HANDLING: INPUT, CLICK, MODAL, WATCHLIST
    function attachCardListeners() {
        // Detail Modal Buttons (using Array Method find())
        const detailButtons = gridContainer.querySelectorAll('.vibe-detail-btn');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const malId = Number(btn.getAttribute('data-id'));
                // Array Method: find() - locate item in dataset
                const anime = STATE.rawData.find(item => item.mal_id === malId);
                if (anime) {
                    openDetailModal(anime);
                }
            });
        });

        // Watchlist Bookmark Toggle
        const bookmarkButtons = gridContainer.querySelectorAll('.vibe-bookmark-btn');
        bookmarkButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const malId = Number(btn.getAttribute('data-id'));
                const index = STATE.watchlist.indexOf(malId);
                if (index > -1) {
                    STATE.watchlist.splice(index, 1);
                } else {
                    STATE.watchlist.push(malId);
                }
                localStorage.setItem('flipplay_watchlist', JSON.stringify(STATE.watchlist));
                updateStats();
                applyFiltersAndRender();
            });
        });
    }

    // Quick-View Detail Modal (Template Literal & find())
    function openDetailModal(anime) {
        if (!modalOverlay || !modalBody) return;
        const auraInfo = AURA_CONFIG[anime.aura] || AURA_CONFIG['high-energy'];
        const posterUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url;
        const animeUrl = anime.url || (anime.mal_id ? `https://myanimelist.net/anime/${anime.mal_id}` : '#');
        const animeSource = anime.url ? 'Kitsu' : 'MyAnimeList';
        const genres = (anime.genres || []).map(g => `<span class="px-2.5 py-1 rounded-full text-xs bg-white/10 text-white">${g.name}</span>`).join(' ');
        const studios = (anime.studios || []).map(s => s.name).join(', ') || 'N/A';

        modalBody.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                <div class="sm:col-span-5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src="${posterUrl}" alt="${escapeHtml(anime.title)}" class="w-full object-cover">
                </div>
                <div class="sm:col-span-7 space-y-4">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${auraInfo.badgeClass}">
                            ${auraInfo.icon} ${auraInfo.label}
                        </span>
                        <span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ⭐ Skor ${anime.score || 'N/A'}
                        </span>
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300">
                            ${anime.type} &bull; ${anime.episodes ? anime.episodes + ' Ep' : 'Movie'}
                        </span>
                    </div>

                    <h2 class="text-2xl font-extrabold text-white leading-tight">
                        ${escapeHtml(anime.title_english || anime.title)}
                    </h2>
                    <p class="text-xs font-mono text-gray-400">${escapeHtml(anime.title_japanese || anime.title)}</p>

                    <div class="text-xs text-gray-300 space-y-1.5 pt-2 border-t border-white/10">
                        <p><strong class="text-white">Studio:</strong> ${studios}</p>
                        <p><strong class="text-white">Status Penayangan:</strong> ${anime.status || 'Finished'}</p>
                        <p><strong class="text-white">Tahun Rilis:</strong> ${anime.year || 'N/A'}</p>
                    </div>

                    <div class="flex flex-wrap gap-1.5 pt-1">
                        ${genres}
                    </div>

                    <div class="pt-2">
                        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sinopsis Cerita</h4>
                        <p class="text-xs text-gray-300 leading-relaxed max-h-40 overflow-y-auto pr-1">
                            ${anime.synopsis ? escapeHtml(anime.synopsis) : 'Sinopsis tidak tersedia.'}
                        </p>
                    </div>

                    <div class="pt-4 flex items-center gap-3">
                        <a href="${animeUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition-all flex items-center gap-1.5">
                            <span>Buka di ${animeSource}</span>
                            <span>↗</span>
                        </a>
                        <button type="button" class="modal-close-trigger px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Show modal with animation
        modalOverlay.classList.remove('hidden');
        modalOverlay.classList.add('flex');
        setTimeout(() => {
            if (modalContent) {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }
        }, 10);

        const closeTriggers = modalBody.querySelectorAll('.modal-close-trigger');
        closeTriggers.forEach(btn => btn.addEventListener('click', closeDetailModal));
    }

    function closeDetailModal() {
        if (!modalOverlay || !modalContent) return;
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modalOverlay.classList.add('hidden');
            modalOverlay.classList.remove('flex');
        }, 200);
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDetailModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeDetailModal();
        });
    }

    function initListeners() {
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                STATE.searchQuery = e.target.value;
                if (searchClearBtn) {
                    if (STATE.searchQuery) searchClearBtn.classList.remove('hidden');
                    else searchClearBtn.classList.add('hidden');
                }
                applytersAFilndRender();
            });

            window.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                    e.preventDefault();
                    searchInput.focus();
                }
                if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
                    closeDetailModal();
                }
            });
        }

        if (searchClearBtn && searchInput) {
            searchClearBtn.addEventListener('click', () => {
                searchInput.value = '';
                STATE.searchQuery = '';
                searchClearBtn.classList.add('hidden');
                applyFiltersAndRender();
                searchInput.focus();
            });
        }

        if (auraButtons.length > 0) {
            auraButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    auraButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    STATE.currentAura = btn.getAttribute('data-aura') || 'all';
                    applyFiltersAndRender();
                });
            });
        }

        if (filterTypeSelect) {
            filterTypeSelect.addEventListener('change', (e) => {
                STATE.currentType = e.target.value;
                applyFiltersAndRender();
            });
        }

        if (sortBySelect) {
            sortBySelect.addEventListener('change', (e) => {
                STATE.sortBy = e.target.value;
                applyFiltersAndRender();
            });
        }

        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => {
                STATE.simulateErrorMode = false;
                fetchVibeData();
            });
        }
        if (btnSimulateError) {
            btnSimulateError.addEventListener('click', () => {
                STATE.simulateErrorMode = !STATE.simulateErrorMode;
                if (STATE.simulateErrorMode) {
                    btnSimulateError.classList.add('bg-red-600', 'text-white');
                    fetchVibeData();
                } else {
                    btnSimulateError.classList.remove('bg-red-600', 'text-white');
                    fetchVibeData();
                }
            });
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initApp() {
        initElements();
        initListeners();
        fetchVibeData();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();
