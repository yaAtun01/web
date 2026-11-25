<?php   
// untuk compailer agar menjadi lebih ketat dalam hal strit pes
declare(strict_types=1);

namespace Model\media;

use invalidArgumentException;
abstract class Media{

    protected string $title;
    protected int $duration;

    public function __construct(string $title, int $duration){
        if ($duration <= 0){
            throw new invalidArgumentException("durasi tidak boleh kurang dari 0");
        }

        $this -> title = $title;
        $this -> duration = $duration;

    }

    abstract public function play() : string;
    abstract public function getInfo() : string;


    public function getTitle() : string{
        return $this -> title;
    }

    public function getDuration() : int{
        return $this -> duration;
    }

}


