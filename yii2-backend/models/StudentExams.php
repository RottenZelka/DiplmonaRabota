<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%student_exams}}".
 *
 * @property int $id
 * @property int $student_id
 * @property int $exam_id
 * @property string $status
 * @property string|null $checked_at
 * @property string|null $created_at
 *
 * @property Exams $exam
 * @property Student $student
 */
class StudentExams extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%student_exams}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['student_id', 'exam_id', 'status'], 'required'],
            [['student_id', 'exam_id'], 'integer'],
            [['checked_at', 'created_at'], 'safe'],
            [['status'], 'string', 'max' => 50],
            [['exam_id'], 'exist', 'skipOnError' => true, 'targetClass' => Exams::class, 'targetAttribute' => ['exam_id' => 'id']],
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
            'student_id' => 'Student ID',
            'exam_id' => 'Exam ID',
            'status' => 'Status',
            'checked_at' => 'Checked At',
            'created_at' => 'Created At',
        ];
    }

    /**
     * Gets query for [[Exam]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getExam()
    {
        return $this->hasOne(Exams::class, ['id' => 'exam_id']);
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
}
