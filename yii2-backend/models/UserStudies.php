<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%user_studies}}".
 *
 * @property int $id
 * @property int $user_id
 * @property int $study_id
 *
 * @property Study $study
 * @property User $user
 */
class UserStudies extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%user_studies}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['user_id', 'study_id'], 'required'],
            [['user_id', 'study_id'], 'integer'],
            [['study_id'], 'exist', 'skipOnError' => true, 'targetClass' => Studies::class, 'targetAttribute' => ['study_id' => 'id']],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'study_id' => 'Study ID',
        ];
    }

    /**
     * Gets query for [[Study]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudy()
    {
        return $this->hasOne(Study::class, ['id' => 'study_id']);
    }

    /**
     * Gets query for [[User]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }
}
