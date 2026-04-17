<?php require 'vendor/autoload.php'; use Intervention\Image\ImageManager; use Intervention\Image\Drivers\Imagick\Driver; $m = new ImageManager(new Driver()); $i = $m->create(100, 100); echo 'Yes';
