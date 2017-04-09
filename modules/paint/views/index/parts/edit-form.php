<?php
use app\modules\paint\forms\ImageForm;
use yii\captcha\Captcha;
use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use yii\imagine\Image;

/**
 * @var $this \yii\web\View
 * @var $saveUrl string
 * @var $imageForm ImageForm
 */
?>

<div id="paint-modal" class="modal fade" tabindex="-1" role="dialog" style="display: none;">
    <div class="modal-dialog" role="document">
        <?php $form = ActiveForm::begin([
            'layout' => 'horizontal',
            'enableAjaxValidation' => true,
        ]); ?>
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">Сохранение картинки</h4>
            </div>
            <div class="modal-body">
                <?= Html::activeHiddenInput($imageForm, 'imageId') ?>
                <?= Html::activeHiddenInput($imageForm, 'imageData') ?>
                <?= $form->field($imageForm, 'title') ?>
            <?php if ($imageForm->image === null) { ?>
                <?= $form->field($imageForm, 'password')->passwordInput() ?>
                <?= $form->field($imageForm, 'password2')->passwordInput() ?>
            <?php } ?>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                <?= Html::submitButton('Сохранить', ['class' => 'btn btn-primary', 'name' => 'submit']) ?>
            </div>
        </div>
        <?php ActiveForm::end(); ?>
    </div>
</div>

<?php $this->registerJs(<<<JS
    $(document).on("beforeSubmit", "#{$form->id}", function () {
        // send data to actionSave by ajax request.
        return false; // Cancel form submitting.
    });
JS
); ?>