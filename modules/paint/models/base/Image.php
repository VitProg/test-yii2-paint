<?php

namespace app\modules\paint\models\base;

use app\modules\paint\models\queries\ImageQuery;
use yii\behaviors\AttributeBehavior;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\db\Expression;

/**
 * This is the model class for table "painter_images".
 *
 * @property integer $id
 * @property string $title
 * @property string $file
 * @property string $pass
 * @property string $updated_at
 * @property string $created_at
 * @property string $ip
 */
class Image extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'painter_images';
    }


    public function behaviors() {
        return [
            [
                'class' => TimestampBehavior::class,
                'createdAtAttribute' => 'created_at',
                'updatedAtAttribute' => 'updated_at',
                'value' => new Expression('now()'),
            ],
            [
                'class' => AttributeBehavior::class,
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['ip'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['ip'],
                ],
                'value' => function() {
                    return \Yii::$app->request->userIP;
                }
            ],
        ];
    }


    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [[/*'title',*/ 'file', 'pass', /*'ip'*/], 'required'],
            [['updated_at', 'created_at'], 'safe'],
            [['title', 'pass', 'file'], 'string', 'max' => 64],
            [['ip'], 'string', 'max' => 15],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'title' => 'Название',
            'pass' => 'Файл',
            'updated_at' => 'Обновлен',
            'created_at' => 'Создан',
            'ip' => 'IP',
        ];
    }

    /**
     * @inheritdoc
     * @return ImageQuery the active query used by this AR class.
     */
    public static function find()
    {
        return new ImageQuery(get_called_class());
    }
}
