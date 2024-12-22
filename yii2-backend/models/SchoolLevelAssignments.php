<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%school_level_assignments}}".
 *
 * @property int $id
 * @property int $school_id
 * @property int $level_id
 *
 * @property SchoolLevel $level
 * @property School $school
 */
class SchoolLevelAssignments extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%school_level_assignments}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['school_id', 'level_id'], 'required'],
            [['school_id', 'level_id'], 'integer'],
            [['level_id'], 'exist', 'skipOnError' => true, 'targetClass' => SchoolLevels::class, 'targetAttribute' => ['level_id' => 'id']],
            [['school_id'], 'exist', 'skipOnError' => true, 'targetClass' => School::class, 'targetAttribute' => ['school_id' => 'id']],
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
            'level_id' => 'Level ID',
        ];
    }

    /**
     * Gets query for [[Level]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getLevel()
    {
        return $this->hasOne(SchoolLevel::class, ['id' => 'level_id']);
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
}
