<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%exam_results}}".
 *
 * @property int $id
 * @property int $exam_id
 * @property int $student_id
 * @property float $score
 * @property string|null $checked_at
 * @property string|null $commentary
 * @property int $max_points
 * @property string $status
 *
 * @property Exams $exam
 * @property Student $student
 */
class ExamResults extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%exam_results}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['exam_id', 'student_id', 'score'], 'required'],
            [['exam_id', 'student_id', 'max_points'], 'integer'],
            [['score'], 'number'],
            [['checked_at'], 'safe'],
            [['commentary', 'status'], 'string'],
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
            'exam_id' => 'Exam ID',
            'student_id' => 'Student ID',
            'score' => 'Score',
            'checked_at' => 'Checked At',
            'commentary' => 'Commentary',
            'max_points' => 'Max Points',
            'status' => 'Status',
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
