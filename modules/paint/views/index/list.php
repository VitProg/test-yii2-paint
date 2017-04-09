<?php
use yii\bootstrap\Html;
use yii\data\ActiveDataProvider;
use yii\helpers\Url;

/**
 * @var $this \yii\web\View
 * @var ActiveDataProvider $provider
 */

?>
<div class="page-title clearfix">
    <h1 class="title pull-left">Список рисунков</h1>
    <div class="pull-right">
        <?= Html::a(Html::icon('plus') . ' Создать', Url::to(['/paint/index/edit']), ['class' => "btn btn-primary"]) ?>
    </div>
</div>

<?= \yii\widgets\ListView::widget([
    'dataProvider' => $provider,
    'itemView' => 'parts/list-item',
    'itemOptions' => [
        'class' => 'col-sm-4 col-md-3'
    ],
    'layout' => "{summary}<br>\n<div class=\"row\">{items}</div>\n{pager}",
]) ?>
