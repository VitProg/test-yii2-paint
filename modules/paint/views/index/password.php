<?php
use app\modules\paint\forms\ImageForm;
use yii\bootstrap\Html;
use yii\helpers\Url;


/**
 * @var $this \yii\web\View
 * @var $imageForm ImageForm
 * @var $action string
 */
?>
<div class="page-title clearfix">
    <h1 class="title pull-left">Пароль для доступа к <?= $action === 'edit' ? 'редактированию' : 'удалению' ?> картинки</h1>
    <div class="pull-right">
        <?= Html::a(Html::icon('eye-open') . ' Показать', Url::to(['/paint/index/view', 'imageId' => $imageForm->image->id]), ['class' => "btn btn-success"]) ?>
    </div>
</div>

<?= $this->render('parts/form-password', ['imageForm' => $imageForm]) ?>
