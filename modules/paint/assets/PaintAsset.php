<?php
/**
 * Created by PhpStorm.
 * User: VitProg
 * Date: 08.04.2017
 * Time: 13:53
 */

namespace app\modules\paint\assets;


use yii\web\AssetBundle;

class PaintAsset extends AssetBundle {
    public $sourcePath = '@app/modules/paint/assets/r/';

    public $css = [
        'paint.css',
    ];
    public $js = [
        'paint.js',
        'paint-history.js',
    ];

    public $depends = [
        'app\modules\paint\assets\SimplifyJsAsset'
    ];
}