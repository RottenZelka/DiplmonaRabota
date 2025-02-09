<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%studies}}".
 *
 * @property int $id
 * @property string $name
 *
 * @property Exams[] $exams
 * @property UserStudies[] $userStudies
 */
class Studies extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%studies}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['name'], 'string', 'max' => 255],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
        ];
    }

    /**
     * Gets query for [[Exams]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getExams()
    {
        return $this->hasMany(Exams::class, ['study_id' => 'id']);
    }

    /**
     * Gets query for [[UserStudies]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUserStudies()
    {
        return $this->hasMany(UserStudies::class, ['study_id' => 'id']);
    }
}
