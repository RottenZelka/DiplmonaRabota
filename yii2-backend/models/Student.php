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
 * @property Application[] $applications
 * @property Image $profilePhoto
 * @property SavedSchool[] $savedSchools
 * @property StudentExam[] $studentExams
 * @property StudentPreviousSchool[] $studentPreviousSchools
 * @property User $user
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
            [['profile_photo_id'], 'exist', 'skipOnError' => true, 'targetClass' => Images::class, 'targetAttribute' => ['profile_photo_id' => 'id']],
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
        return $this->hasMany(Application::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[ProfilePhoto]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getProfilePhoto()
    {
        return $this->hasOne(Image::class, ['id' => 'profile_photo_id']);
    }

    /**
     * Gets query for [[SavedSchools]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSavedSchools()
    {
        return $this->hasMany(SavedSchool::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[StudentExams]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudentExams()
    {
        return $this->hasMany(StudentExam::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[StudentPreviousSchools]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudentPreviousSchools()
    {
        return $this->hasMany(StudentPreviousSchool::class, ['student_id' => 'user_id']);
    }

    /**
     * Gets query for [[User]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }
}
