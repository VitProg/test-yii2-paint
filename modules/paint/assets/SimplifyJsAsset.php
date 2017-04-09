<?php
/**
 * Created by PhpStorm.
 * User: VitProg
 * Date: 08.04.2017
 * Time: 16:29
 */

namespace app\modules\paint\assets;


use yii\web\AssetBundle;

class SimplifyJsAsset extends AssetBundle {

    public $sourcePath = '@bower/simplify-js';
    public $js = [
        'simplify.js',
    ];

}