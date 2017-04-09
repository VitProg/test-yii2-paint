<?php
use app\modules\paint\models\Image;
use app\modules\paint\forms\ImageForm;
use yii\bootstrap\Html;
use yii\helpers\Url;

/**
 * @var $this \yii\web\View
 * @var $image Image
 */
?>

<div class="page-title clearfix">
    <h1 class="title pull-left">Просмотр рисунка</h1>
    <div class="pull-right">
        <?= Html::a(Html::icon('pencil') . ' Редактировать', Url::to(['/paint/index/edit', 'imageId' => $image->id]), ['class' => "btn btn-default"]) ?>
        <?= Html::a(Html::icon('remove') . ' Удалить', Url::to(['/paint/index/delete', 'imageId' => $image->id]), ['class' => "btn btn-default"]) ?>
        <?= Html::a(Html::icon('plus') . ' Создать', Url::to(['/paint/index/edit']), ['class' => "btn btn-primary"]) ?>
    </div>
</div>

<div class="thumbnail">
    <?= Html::img($image->imageUrl) ?>
    <div class="caption">
        <h4><?= $image->title ?></h4>
        <p><time><?= Yii::$app->formatter->asDatetime($image->created_at) ?><br></time></p>
    </div>
</div>
