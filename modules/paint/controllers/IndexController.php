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
use app\modules\paint\forms\ImageForm;
use yii\base\ErrorException;
use yii\data\ActiveDataProvider;
use yii\helpers\Url;
use yii\web\Controller;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class IndexController extends Controller {

    /**
     * список картинок
     * @return string
     */
    public function actionList() {
        PaintAsset::register($this->view);

        Image::deletePasswordFromSession();

        $query = Image::find()
            ->orderBy(['created_at' => SORT_DESC]);

        $provider = new ActiveDataProvider(
            [
                'query' => $query,
                'pagination' => [
                    'defaultPageSize' => 8,
                ],
            ]
        );

        return $this->render(
            'list',
            [
                'provider' => $provider,
            ]
        );
    }

    /**
     * провсмотр картинки
     * @param integer $imageId
     * @return string
     * @throws NotFoundHttpException
     */
    public function actionView($imageId = null) {
        PaintAsset::register($this->view);

        Image::deletePasswordFromSession();

        $image = Image::findOne($imageId);

        if ($image === null) {
            throw new NotFoundHttpException('Рисунок не найден');
        }

        return $this->render(
            'view',
            [
                'image' => $image,
            ]
        );
    }

    /**
     * редактирование/создание картинки
     * @param integer $imageId
     * @return array|string
     * @throws NotFoundHttpException
     */
    public function actionEdit($imageId = null) {
        PaintAsset::register($this->view);

        $image = null;
        $imageForm = new ImageForm();

        if ($imageId) {
            $image = Image::findOne($imageId);
            if ($image === null) {
                throw new NotFoundHttpException('Рисунок не найден');
            }
            // проверяем сохранен ли верный хеш пароля для редактирования/удаления в сессии
            if ($image->checkSessionPassword() === false) {
                // если нет, то выдаем форму ввода пароля
                return $this->password($image, 'edit');
            }
        } else {
            Image::deletePasswordFromSession();
        }

        $imageForm->image = $image;
        $imageForm->scenario = $image === null ? 'create' : 'edit';

        $request = \Yii::$app->request;

        // если пришел post запрос по ajax, то надо его разобрать, проверить и сохранить рисунок
        if ($request->isPost && $request->isAjax) {

            \Yii::$app->response->format = Response::FORMAT_JSON;

            if ($imageForm->load($request->post())) {

                // если это сохранение, а не проверка валидности данных
                if ($request->post('submit')) {

                    if ($imageForm->save($image)) {
                        // очищаем пароль из сессии
                        $image::deletePasswordFromSession();

                        \Yii::$app->session->setFlash('paint', ['warning', 'Рисунок сохранен']);
                        return $this->redirect(['/paint/index/view', 'imageId' => $image->id]);
                    } else {
                        return ['success' => false, 'errors' => $image->errors];
                    }
                }
            }
            return ['success' => false];
        }

        return $this->render(
            'edit',
            [
                'imageForm' => $imageForm,
                'saveUrl' => Url::to('paint/index/save', true),
            ]
        );
    }

    /**
     * Удаление рисунка
     * @param integer $imageId
     * @return array|string
     * @throws NotFoundHttpException
     */
    public function actionDelete($imageId = null) {
        PaintAsset::register($this->view);

        $image = Image::findOne($imageId);
        if ($image === null) {
            throw new NotFoundHttpException('Рисунок не найден');
        }
        // проверяем сохранен ли верный хеш пароля для редактирования/удаления в сессии
        if ($image->checkSessionPassword() === false) {
            // если нет, то выдаем форму ввода пароля
            return $this->password($image, 'delete');
        }
        // очищаем пароль из сессии
        $image::deletePasswordFromSession();

        if ($image->delete()) {
            \Yii::$app->session->setFlash('paint', ['warning', 'Рисунок был успешно удален']);
        } else {
            \Yii::$app->session->setFlash('paint', ['warning','Ошибка удаления рисунка']);
        }

        return $this->redirect(['/paint/index/list']);
    }

    /**
     * ввод паролья для редактирования/удаления рисунка
     * @param integer|Image $imageId
     * @param string $action
     * @return string
     * @throws NotFoundHttpException
     */
    public function password($imageId, $action = 'edit') {
        Image::deletePasswordFromSession();

        if ($imageId instanceof Image) {
            $image = $imageId;
        } else {
            $image = Image::findOne($imageId);
        }

        if ($image === null) {
            throw new NotFoundHttpException('Рисунок не найден');
        }

        $imageForm = new ImageForm();
        $imageForm->image = $image;
        $imageForm->scenario = 'password';

        $request = \Yii::$app->request;
        if ($request->isPost) {
            if ($imageForm->load($request->post()) && $imageForm->validate()) {

                if ($image->checkPassword($imageForm->password)) {
                    $image->savePasswordToSession();
                    return $this->redirect(['/paint/index/' . $action, 'imageId' => $image->id]);
                } else {
                    $imageForm->addError('password', 'Не верный пароль');
                }
            }
        }

        return $this->render(
            'password',
            [
                'imageForm' => $imageForm,
                'action' => $action,
            ]
        );
    }

}