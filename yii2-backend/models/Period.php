<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%period}}".
 *
 * @property int $id
 * @property int $school_id
 * @property string $name
 * @property string $start_date
 * @property string|null $end_date
 * @property string|null $type
 * @property string|null $other_type
 * @property int|null $student_id
 *
 * @property School $school
 * @property Student $student
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
            [['school_id', 'start_date'], 'required'],
            [['school_id', 'student_id'], 'integer'],
            [['start_date', 'end_date'], 'safe'],
            [['type', 'other_type'], 'string'],
            [['name'], 'string', 'max' => 255],
            [['school_id'], 'exist', 'skipOnError' => true, 'targetClass' => School::class, 'targetAttribute' => ['school_id' => 'user_id']],
            [['student_id'], 'exist', 'skipOnError' => true, 'targetClass' => Student::class, 'targetAttribute' => ['student_id' => 'user_id']],
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
            'name' => 'Name',
            'start_date' => 'Start Date',
            'end_date' => 'End Date',
            'type' => 'Type',
            'other_type' => 'Other Type',
            'student_id' => 'Student ID',
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

    /**
     * Gets query for [[Student]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudent()
    {
        return $this->hasOne(Student::class, ['user_id' => 'student_id']);
    }

    /**
     * Finds a period for a specific student where:
     * - The type is "student studied from"
     * - The end date is null
     *
     * @param int $studentId The ID of the student.
     * @return static|null The matching Period model, or null if no period matches the criteria.
     */
    public static function getActiveStudyPeriodByStudent($studentId)
    {
        return self::find()
            ->where(['student_id' => $studentId, 'type' => 'student studied from to', 'end_date' => null])
            ->one();
    }
}
