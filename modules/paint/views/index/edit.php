<?php
use app\modules\paint\models\Image;
use app\modules\paint\forms\ImageForm;
use yii\bootstrap\Html;
use yii\helpers\Url;

/**
 * @var $this \yii\web\View
 * @var $saveUrl string
 * @var $imageForm ImageForm
 */

$this->title = $imageForm->image === null ? 'Создание рисунок' : 'Редактирование рисунка';
$imageUrl = $imageForm->image ? $imageForm->image->imageUrl : '';
?>
<div class="page-title clearfix">
    <h1 class="title pull-left"><?= $this->title ?></h1>
    <?php if ($imageForm->image) { ?>
    <div class="pull-right">
        <?= Html::a(Html::icon('eye-open') . ' Показать', Url::to(['/paint/index/view', 'imageId' => $imageForm->image->id]), ['class' => "btn btn-success"]) ?>
    </div>
    <? } ?>
</div>

<div class="center">
    <div id="painter"></div>
</div>

<?php
$this->registerJs(<<<JS
    new Painter('#painter', {
        save_url: "{$saveUrl}",
        img_url: "{$imageUrl}",
        modal: '#paint-modal'
    });
JS
);
echo $this->render('parts/edit-form', [
    'imageForm' => $imageForm
]);



