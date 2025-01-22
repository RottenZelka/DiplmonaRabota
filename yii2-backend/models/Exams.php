<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%exams}}".
 *
 * @property int $id
 * @property int $school_id
 * @property string $name
 * @property int $time_needed_minutes
 * @property int|null $is_mandatory
 * @property string $type
 * @property int|null $study_id
 * @property string|null $created_at
 * @property string|null $updated_at
 *
 * @property ExamQuestions[] $examQuestions
 * @property School $school
 * @property StudentExams[] $studentExams
 * @property Studies $study
 */
class Exams extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%exams}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['school_id', 'name', 'time_needed_minutes', 'type'], 'required'],
            [['school_id', 'time_needed_minutes', 'is_mandatory', 'study_id'], 'integer'],
            [['created_at', 'updated_at'], 'safe'],
            [['name'], 'string', 'max' => 255],
            [['type'], 'string', 'max' => 50],
            [['school_id'], 'exist', 'skipOnError' => true, 'targetClass' => School::class, 'targetAttribute' => ['school_id' => 'user_id']],
            [['study_id'], 'exist', 'skipOnError' => true, 'targetClass' => Studies::class, 'targetAttribute' => ['study_id' => 'id']],
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
            'time_needed_minutes' => 'Time Needed Minutes',
            'is_mandatory' => 'Is Mandatory',
            'type' => 'Type',
            'study_id' => 'Study ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * Gets query for [[ExamQuestions]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getExamQuestions()
    {
        return $this->hasMany(ExamQuestions::class, ['exam_id' => 'id']);
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
     * Gets query for [[StudentExams]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudentExams()
    {
        return $this->hasMany(StudentExams::class, ['exam_id' => 'id']);
    }

    /**
     * Gets query for [[Study]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudy()
    {
        return $this->hasOne(Studies::class, ['id' => 'study_id']);
    }
}
