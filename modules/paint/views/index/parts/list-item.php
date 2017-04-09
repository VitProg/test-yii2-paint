<?php
use \app\modules\paint\models\Image;
use yii\bootstrap\Html;
use yii\helpers\Url;
use \yii\widgets\ListView;
/**
 * @var Image $model
 * @var mixed $key
 * @var integer $index
 * @var ListView $widget
 */

$url = Url::to(['/paint/index/view', 'imageId' => $model->id]);
?>
    <div class="thumbnail">
        <?= Html::a(Html::img($model->thumbUrl), $url) ?>
        <div class="caption">
            <h4><?= Html::a($model->title, $url) ?></h4>
            <p><time><?= Yii::$app->formatter->asDatetime($model->created_at) ?><br></time></p>
            <p class="text-right">
                <?= Html::a(Html::icon('pencil'), Url::toRoute(['/paint/index/edit', 'imageId' => $model->id]), ['title' => 'Редактировать', 'class' => 'btn btn-default btn-xs']) ?>
                <?= Html::a(Html::icon('remove'), Url::toRoute(['/paint/index/delete', 'imageId' => $model->id]), ['title' => 'Удалить', 'class' => 'btn btn-default btn-xs']) ?>
            </p>
        </div>
    </div>
