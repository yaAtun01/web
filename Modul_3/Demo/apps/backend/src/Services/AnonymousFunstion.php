<?php

function Hello(string $name){
    echo "hello $name \n";

}

function Hello2(string $name){
    return  "goodbye $name \n";
}

echo Hello2("Dimas");