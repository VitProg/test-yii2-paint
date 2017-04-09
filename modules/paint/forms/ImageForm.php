<?php
/**
 * Created by PhpStorm.
 * User: VitProg
 * Date: 09.04.2017
 * Time: 10:25
 */

namespace app\modules\paint\forms;


use app\modules\paint\models\Image;
use yii\base\ErrorException;
use yii\base\Model;
use yii\web\NotFoundHttpException;

/**
 * Class ImageForm
 * @package modules\paint\forms
 *
 * @property integer $imageId
 * @property string $title
 * @property string $password
 * @property string $password2
 * @property string $verifyCode
 * @property string $imageData
 *
 * @property Image $image
 */
class ImageForm extends Model {
    public $imageId;
    public $title;
    public $password;
    public $password2;
    public $verifyCode;
    public $imageData;

    protected $image;


    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            ['title', 'trim'],
            ['title', 'required', 'message' => 'Необходимо заполнить "{attribute}"', 'on' => ['create', 'edit']],

            ['imageData', 'required', 'message' => 'Ошибка передачи картинки', 'on' => ['create', 'edit']],

            ['password', 'required', 'message' => 'Необходимо заполнить "{attribute}"', 'on' => ['create', 'edit', 'password']],
            ['password', 'string', 'min' => 3],

            ['password2', 'required', 'message' => 'Необходимо заполнить "{attribute}"', 'on' => ['create']],
            ['password2', 'compare', 'compareAttribute' => 'password', 'message' => 'Пароли не совпадают', 'on' => ['create']],
        ];
    }

    /**
     * @return array customized attribute labels
     */
    public function attributeLabels()
    {
        return [
            'title' => 'Название',
            'password' => 'Пароль',
            'password2' => 'Еще раз',
            'verifyCode' => 'Код с картинки',
        ];
    }

    /**
     * сохраняем рисунок в БД
     * @param Image|null $image
     * @return bool
     * @throws ErrorException
     * @throws NotFoundHttpException
     */
    public function save(Image &$image = null) {
        if ($image === null) {
            $image = new Image();
        }

        if (!$image) {
            throw new NotFoundHttpException('Рисунок не найден');
        }

        $image->title = $this->title;
        if ($image->isNewRecord === true) {
            // если новая, то нужно сохранить хеш пароля
            $image->pass = \Yii::$app->security->generatePasswordHash($this->password);
        }

        // проверяем коррестность данных
        if ($image->validate(['pass', 'title']) === false) {
            return false;
        }

        // сохраняем картинок на диск
        if (($result = $image->saveImageFromData($this->imageData)) !== true) {
            throw new ErrorException('Не удалось сохранить рисунок (' . $result . ')');
        }

        // сохраняем в БД
        if ($image->save(true)) {
            $image::deletePasswordFromSession();
            return true;
        } else {
            $image->deleteFiles();
            return false;
        }
    }

    /**
     * @return Image
     */
    public function getImage() {
        return $this->image;
    }

    /**
     * @param Image $image
     */
    public function setImage($image) {
        $this->image = $image;

        if ($this->image) {
            $this->imageId = $this->image->id;
            $this->title = $this->image->title;
        }
    }

}