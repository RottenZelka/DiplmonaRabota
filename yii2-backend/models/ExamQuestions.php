<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%exam_questions}}".
 *
 * @property int $id
 * @property int $exam_id
 * @property string $question_text
 * @property string $type
 * @property string|null $choices
 * @property string|null $created_at
 * @property string|null $updated_at
 *
 * @property Exam $exam
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
            [['exam_id', 'question_text', 'type'], 'required'],
            [['exam_id'], 'integer'],
            [['question_text', 'choices'], 'string'],
            [['created_at', 'updated_at'], 'safe'],
            [['type'], 'string', 'max' => 50],
            [['exam_id'], 'exist', 'skipOnError' => true, 'targetClass' => Exam::class, 'targetAttribute' => ['exam_id' => 'id']],
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
            'type' => 'Type',
            'choices' => 'Choices',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * Gets query for [[Exam]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getExam()
    {
        return $this->hasOne(Exam::class, ['id' => 'exam_id']);
    }
}
