<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%links}}".
 *
 * @property int $id
 * @property string $url
 * @property string $type
 * @property int|null $author_id
 * @property int|null $application_id
 * @property int|null $question_id
 * @property int|null $answer_id
 *
 * @property StudentAnswers $answer
 * @property Applications $application
 * @property Applications[] $applications
 * @property School $author
 * @property ExamQuestions $question
 * @property School[] $schools
 * @property Student[] $students
 */
class Links extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%links}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['url', 'type'], 'required'],
            [['type'], 'string'],
            [['author_id', 'application_id', 'question_id', 'answer_id'], 'integer'],
            [['url'], 'string', 'max' => 255],
            [['author_id'], 'exist', 'skipOnError' => true, 'targetClass' => School::class, 'targetAttribute' => ['author_id' => 'user_id']],
            [['answer_id'], 'exist', 'skipOnError' => true, 'targetClass' => StudentAnswers::class, 'targetAttribute' => ['answer_id' => 'id']],
            [['application_id'], 'exist', 'skipOnError' => true, 'targetClass' => Applications::class, 'targetAttribute' => ['application_id' => 'id']],
            [['question_id'], 'exist', 'skipOnError' => true, 'targetClass' => ExamQuestions::class, 'targetAttribute' => ['question_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'url' => 'Url',
            'type' => 'Type',
            'author_id' => 'Author ID',
            'application_id' => 'Application ID',
            'question_id' => 'Question ID',
            'answer_id' => 'Answer ID',
        ];
    }

    /**
     * Gets query for [[Answer]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getAnswer()
    {
        return $this->hasOne(StudentAnswers::class, ['id' => 'answer_id']);
    }

    /**
     * Gets query for [[Application]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getApplication()
    {
        return $this->hasOne(Applications::class, ['id' => 'application_id']);
    }

    /**
     * Gets query for [[Applications]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getApplications()
    {
        return $this->hasMany(Applications::class, ['file_field' => 'id']);
    }

    /**
     * Gets query for [[Author]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getAuthor()
    {
        return $this->hasOne(School::class, ['user_id' => 'author_id']);
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
     * Gets query for [[Schools]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchools()
    {
        return $this->hasMany(School::class, ['profile_photo_id' => 'id']);
    }

    /**
     * Gets query for [[Students]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudents()
    {
        return $this->hasMany(Student::class, ['profile_photo_id' => 'id']);
    }
}
