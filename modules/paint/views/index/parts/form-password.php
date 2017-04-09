<?php
use app\modules\paint\forms\ImageForm;
use yii\bootstrap\ActiveForm;
use yii\bootstrap\Html;

/**
 * @var $this \yii\web\View
 * @var $imageForm ImageForm
 */
?>

<?php $form = ActiveForm::begin([
    'id' => 'paint-password-form',
    'layout' => 'horizontal',
    'enableClientValidation' => true,
    'validateOnSubmit' => false,
]); ?>
    <?= Html::activeHiddenInput($imageForm, 'imageId') ?>
    <?= $form->field($imageForm, 'password')->passwordInput() ?>

    <div class="form-group">
        <div class="col-md-offset-3 col-md-3">
            <?= Html::submitButton('Отправить', ['class' => 'btn btn-primary', 'name' => 'submit']) ?>
        </div>
    </div>

<?php ActiveForm::end(); ?>
