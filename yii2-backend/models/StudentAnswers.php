<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%student_answers}}".
 *
 * @property int $id
 * @property int $student_id
 * @property int $exam_id
 * @property int $question_id
 * @property string|null $answer
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property string|null $commentary
 * @property int|null $points
 *
 * @property Exams $exam
 * @property Links[] $links
 * @property ExamQuestions $question
 * @property Student $student
 */
class StudentAnswers extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%student_answers}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['student_id', 'exam_id', 'question_id'], 'required'],
            [['student_id', 'exam_id', 'question_id', 'points'], 'integer'],
            [['answer', 'commentary'], 'string'],
            [['created_at', 'updated_at'], 'safe'],
            [['exam_id'], 'exist', 'skipOnError' => true, 'targetClass' => Exams::class, 'targetAttribute' => ['exam_id' => 'id']],
            [['question_id'], 'exist', 'skipOnError' => true, 'targetClass' => ExamQuestions::class, 'targetAttribute' => ['question_id' => 'id']],
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
            'question_id' => 'Question ID',
            'answer' => 'Answer',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'commentary' => 'Commentary',
            'points' => 'Points',
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
     * Gets query for [[Links]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getLinks()
    {
        return $this->hasMany(Links::class, ['answer_id' => 'id']);
    }

    /**
     * Gets query for [[Question]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getQuestion()
    {
        return $this->hasOne(ExamQuestions::class, ['id' => 'question_id']);
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
