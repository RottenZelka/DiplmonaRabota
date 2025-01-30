<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%exam_questions}}".
 *
 * @property int $id
 * @property int $exam_id
 * @property string $question_text
 * @property string|null $choices
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property string $question_type
 * @property string|null $correct_answer
 * @property int $max_points
 *
 * @property Exams $exam
 * @property StudentAnswers[] $studentAnswers
 */
class ExamQuestions extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%exam_questions}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['exam_id', 'question_text'], 'required'],
            [['exam_id', 'max_points'], 'integer'],
            [['question_text', 'choices', 'question_type', 'correct_answer'], 'string'],
            [['created_at', 'updated_at'], 'safe'],
            [['exam_id'], 'exist', 'skipOnError' => true, 'targetClass' => Exams::class, 'targetAttribute' => ['exam_id' => 'id']],
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
            'question_text' => 'Question Text',
            'choices' => 'Choices',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'question_type' => 'Question Type',
            'correct_answer' => 'Correct Answer',
            'max_points' => 'Max Points',
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
     * Gets query for [[StudentAnswers]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudentAnswers()
    {
        return $this->hasMany(StudentAnswers::class, ['question_id' => 'id']);
    }
}
