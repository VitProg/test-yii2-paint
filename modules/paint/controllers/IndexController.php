<?php
/**
 * Created by PhpStorm.
 * User: VitProg
 * Date: 08.04.2017
 * Time: 12:29
 */

namespace app\modules\paint\controllers;


use app\modules\paint\assets\PaintAsset;
use app\modules\paint\models\Image;
use Imagine\Gd\Imagine;
use yii\base\ErrorException;
use yii\helpers\Url;
use yii\helpers\VarDumper;
use yii\web\Controller;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IndexController extends Controller {

    public function actionList() {
        PaintAsset::register($this->view);
        return $this->render('list');
    }

    public function actionEdit($imageId = null) {
        PaintAsset::register($this->view);
        $image = null;
        return $this->render('edit', [
            'image' => $image,
            'saveUrl' => Url::to('paint/index/save', true),
        ]);
    }

    // post ajax
    public function actionSave($imageId = null) {
        \Yii::$app->response->format = Response::FORMAT_JSON;

        $image = $imageId ? Image::findOne($imageId) : new Image();

        if (!$image) {
            throw new NotFoundHttpException('Рисунок не найден');
        }

        if ($image->isNewRecord === false && $image->checkPassword(\Yii::$app->request->post('pass'))) {
            throw new ForbiddenHttpException('У вас нет доступа для редактирования этой картинки');
        }

        if (($result = $image->saveImageFromData(\Yii::$app->request->getBodyParam('data'))) !== true) {
            throw new ErrorException('Не удалось сохранить картинку (' . $result . ')');
        }

        if ($image->isNewRecord === true) {
            $pass = $image->generatePassword();
        } else {
            $pass = \Yii::$app->request->post('pass');
        }

        if ($image->save(true)) {
            return [
                'res' => 'ok',
                'img' => $image->imageFileUrl,
                'pass' => $pass,
            ];
        } else {
            return [
                'res' => 'err',
                'err' => $image->errors
            ];
        }
    }

    // get ajax
    /**
     * Проверка возможности редактирования картинки
     * @param $imageId
     * @param $password
     */
    public function actionCheck($imageId, $password) {


    }

}