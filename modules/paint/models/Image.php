<?php
/**
 * Created by PhpStorm.
 * User: VitProg
 * Date: 08.04.2017
 * Time: 18:16
 */

namespace app\modules\paint\models;

use \app\modules\paint\models\base\Image as ImageBase;
use Imagine\Gd\Imagine;
use Imagine\Image\Box;
use Imagine\Image\ImageInterface;
use phpDocumentor\Reflection\Types\Static_;
use yii\helpers\FileHelper;
use yii\helpers\StringHelper;
use yii\helpers\VarDumper;

/**
 * Class Image
 * @package app\modules\paint\models
 *
 * @property string $imageUrl
 * @property string $thumbUrl
 * @property string $imageFullPath
 * @property string $thumbFullPath
 */
class Image extends ImageBase {

    /**
     * ширины/высота превьюшки (px)
     */
    const THUMB_SIZE = 250;

    /**
     * сохраняет файлы картинку, полную и превьюшку и записывает имя файла в модель
     * @param string $imageData
     * @return boolean
     */
    public function saveImageFromData($imageData) {

        try {
            // base64
            if (StringHelper::startsWith($imageData, 'data:image')) {
                $imageData = str_replace('data:image/jpeg;base64,', '', $imageData);
                $imageData = base64_decode($imageData);
            }

            $imagine = new Imagine();
            $imageFile = $imagine->load($imageData);

            if (!$imageFile) {
                return __LINE__;
            }

            $date = date('Ym');

            $directoryName = 'norm/' . $date;
            FileHelper::createDirectory(\Yii::getAlias('@webroot/uploads/') . $directoryName);
            $imgFileName = \Yii::$app->security->generateRandomString(12) . '_' . time() . '.jpg';

            $imageFile->save(
                \Yii::getAlias('@webroot/uploads/') . $directoryName . '/' . $imgFileName,
                [
                    'quality' => 90
                ]
            );

            $thumbDirectoryName = 'thumb/' . $date;
            FileHelper::createDirectory(\Yii::getAlias('@webroot/uploads/') . $thumbDirectoryName);

            $imageFile
                ->thumbnail(new Box(self::THUMB_SIZE, self::THUMB_SIZE), ImageInterface::THUMBNAIL_OUTBOUND)
                ->save(
                    \Yii::getAlias('@webroot/uploads/') . $thumbDirectoryName . '/' . $imgFileName,
                    [
                        'quality' => 75
                    ]
                );


            $this->deleteFiles();

            $this->file = $date . '/' . $imgFileName;

            return true;
        } catch (\Exception $ex) {
            return $ex->getMessage();
        }
    }

    /**
     * при удалении рисунка, удаляем его файлы
     */
    public function beforeDelete() {
        $this->deleteFiles();
        return parent::beforeDelete();
    }


    /**
     * удаляем файлы с диска
     */
    public function deleteFiles() {
        @unlink($this->imageFullPath);
        @unlink($this->thumbFullPath);
        $this->file = null;
    }

    /**
     * возвращает полный путь до фала картинки
     * @return bool|string
     */
    public function getImageFullPath() {
        return $this->file ? \Yii::getAlias('@webroot/uploads/norm/' . $this->file) : false;
    }

    /**
     * возвращает полный путь до файла превьюшки
     * @return bool|string
     */
    public function getThumbFullPath() {
        return $this->file ? \Yii::getAlias('@webroot/uploads/thumb/' . $this->file) : false;
    }

    /**
     * возвращает URl картинки
     * @return bool|string
     */
    public function getImageUrl() {
        return $this->file ? '/uploads/norm/' . $this->file : false;
    }

    /**
     * возвращает URl превьюшки
     * @return bool|string
     */
    public function getThumbUrl() {
        return $this->file ? '/uploads/thumb/' . $this->file : false;
    }

    /**
     * проверяет пароль на редактирование/удаления рисунка
     * @param string $pass
     * @return bool
     */
    public function checkPassword($pass) {
        return \Yii::$app->security->validatePassword($pass, $this->pass);
    }

    /**
     * сохраняет хеш пароля для редактирования/удаления рисунка в сессию
     */
    public function savePasswordToSession() {
        \Yii::$app->session->set('paint-edit', [$this->id, $this->pass]);
    }

    /**
     * удаляет хеш пароля для редактирования/удаления рисунка из сессию
     */
    public static function deletePasswordFromSession() {
        \Yii::$app->session->remove('paint-edit');
    }

    /**
     * проверяет корректность пароля для редактирования/удаления рисунка в сессию
     */
    public function checkSessionPassword() {
        $sessionPassHash = \Yii::$app->session->get('paint-edit');
        return $sessionPassHash && is_array($sessionPassHash) &&
            $this->id === intval($sessionPassHash[0]) && $this->pass === $sessionPassHash[1];
    }

}