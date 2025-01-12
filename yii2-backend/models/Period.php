<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%period}}".
 *
 * @property int $id
 * @property int $school_id
 * @property string $start_date
 * @property string $end_date
 * @property string|null $type
 * @property string|null $other_typr
 *
 * @property School $school
 */
class Period extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%period}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['school_id', 'start_date', 'end_date'], 'required'],
            [['school_id'], 'integer'],
            [['start_date', 'end_date'], 'safe'],
            [['type', 'other_typr'], 'string'],
            [['school_id'], 'exist', 'skipOnError' => true, 'targetClass' => School::class, 'targetAttribute' => ['school_id' => 'user_id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'school_id' => 'School ID',
            'start_date' => 'Start Date',
            'end_date' => 'End Date',
            'type' => 'Type',
            'other_typr' => 'Other Typr',
        ];
    }

    /**
     * Gets query for [[School]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchool()
    {
        return $this->hasOne(School::class, ['user_id' => 'school_id']);
    }
}
