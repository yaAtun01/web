<?php

declare(strict_types=1);

namespace Model\film;

use Model\media\Media;

class Film extends Media{

    private float $rating;
    private string $genre;

    public function __construct(string $title, int $duration, float $rating, string $genre){
        parent:: __construct($title, $duration);
        $this -> rating = $rating;
        $this -> genre = $genre;
    }

    public function play() : string{
        return "memutar film $this->title dengan durasi $this->duration menit, rating $this->rating, genre $this->genre";
    } 

    public function getInfo() : string{
        return "Film: $this->title, Durasi: $this->duration menit, Rating: $this->rating, Genre: $this->genre";
    }

    public function getRating() : float{
        return $this -> rating;
    }

    public function getGenre() : string{
        return $this -> genre;
    }

}


