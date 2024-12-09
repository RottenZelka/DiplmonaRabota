<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%school_studies}}".
 *
 * @property int $id
 * @property int $school_id
 * @property int $study_id
 *
 * @property School $school
 * @property Study $study
 */
class SchoolStudies extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%school_studies}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['school_id', 'study_id'], 'required'],
            [['school_id', 'study_id'], 'integer'],
            [['school_id'], 'exist', 'skipOnError' => true, 'targetClass' => School::class, 'targetAttribute' => ['school_id' => 'id']],
            [['study_id'], 'exist', 'skipOnError' => true, 'targetClass' => Study::class, 'targetAttribute' => ['study_id' => 'id']],
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
            'study_id' => 'Study ID',
        ];
    }

    /**
     * Gets query for [[School]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchool()
    {
        return $this->hasOne(School::class, ['id' => 'school_id']);
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
}
