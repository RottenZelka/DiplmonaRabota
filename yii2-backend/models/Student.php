<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%student}}".
 *
 * @property int $user_id
 * @property string $name
 * @property int|null $profile_photo_id
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property string $dob
 *
 * @property Applications[] $applications
 * @property ExamResults[] $examResults
 * @property Period[] $periods
 * @property Links $profilePhoto
 * @property SavedSchools[] $savedSchools
 * @property StudentAnswers[] $studentAnswers
 * @property Users $user
 */
class Student extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%student}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['user_id', 'name'], 'required'],
            [['user_id', 'profile_photo_id'], 'integer'],
            [['created_at', 'updated_at', 'dob'], 'safe'],
            [['name'], 'string', 'max' => 255],
            [['user_id'], 'unique'],
            [['profile_photo_id'], 'exist', 'skipOnError' => true, 'targetClass' => Links::class, 'targetAttribute' => ['profile_photo_id' => 'id']],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'user_id' => 'User ID',
            'name' => 'Name',
            'profile_photo_id' => 'Profile Photo ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'dob' => 'Dob',
        ];
    }

    /**
     * Gets query for [[Applications]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getApplications()
    {
        return $this->hasMany(Applications::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[ExamResults]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getExamResults()
    {
        return $this->hasMany(ExamResults::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[Periods]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getPeriods()
    {
        return $this->hasMany(Period::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[ProfilePhoto]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getProfilePhoto()
    {
        return $this->hasOne(Links::class, ['id' => 'profile_photo_id']);
    }

    /**
     * Gets query for [[SavedSchools]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSavedSchools()
    {
        return $this->hasMany(SavedSchools::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[StudentAnswers]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudentAnswers()
    {
        return $this->hasMany(StudentAnswers::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[User]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(Users::class, ['id' => 'user_id']);
    }
}
