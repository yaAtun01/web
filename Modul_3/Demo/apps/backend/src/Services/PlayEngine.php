<?php

declare(strict_types=1);

namespace Services\PlayEngine;
//impor modul atau librery atau class
use Model\media\Media;

class PlayEngine{
    private array $library = [];

    public function addMedia(Media $media): self {
        $this->library[] = $media;
        return $this;
    }
    public function playAll(){
        foreach($this->library as $media){
            $media->play();
        }

    }
    public function totalDuration() : int {

        return array_sum(
            array_map(fn(Media $media) : int  => $media->getDuration(), $this->library)
        );
    }

    public function filterByGenre(string $genre) : array {
        return array_values(
            array_filter(
                $this->library, 
                fn(Media $media) : bool => 
                $media instanceof \Model\film\Film && strcasecmp($media->getGenre(), $genre) === 0
            )
        );
    }

}