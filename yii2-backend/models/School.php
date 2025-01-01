<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%school}}".
 *
 * @property int $id
 * @property string $name
 * @property string|null $address
 * @property string|null $description
 * @property int|null $profile_photo_id
 * @property string|null $created_at
 * @property string|null $updated_at
 *
 * @property Applications[] $applications
 * @property Exams[] $exams
 * @property Images $profilePhoto
 * @property SavedSchools[] $savedSchools
 * @property SchoolAlbum[] $schoolAlbums
 * @property SchoolLevelAssignment[] $schoolLevelAssignments
 * @property SchoolStudy[] $schoolStudies
 * @property StudentPreviousSchool[] $studentPreviousSchools
 */
class School extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%school}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['description'], 'string'],
            [['profile_photo_id'], 'integer'],
            [['created_at', 'updated_at'], 'safe'],
            [['name', 'address'], 'string', 'max' => 255],
            [['profile_photo_id'], 'exist', 'skipOnError' => true, 'targetClass' => Images::class, 'targetAttribute' => ['profile_photo_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'address' => 'Address',
            'description' => 'Description',
            'profile_photo_id' => 'Profile Photo ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * Gets query for [[Applications]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getApplications()
    {
        return $this->hasMany(Application::class, ['school_id' => 'user_id']);
    }

    /**
     * Gets query for [[Exams]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getExams()
    {
        return $this->hasMany(Exam::class, ['school_id' => 'user_id']);
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
        return $this->hasMany(SavedSchool::class, ['school_id' => 'user_id']);
    }

    /**
     * Gets query for [[SchoolAlbums]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchoolAlbums()
    {
        return $this->hasMany(SchoolAlbum::class, ['school_id' => 'user_id']);
    }

    /**
     * Gets query for [[SchoolLevelAssignments]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchoolLevelAssignments()
    {
        return $this->hasMany(SchoolLevelAssignment::class, ['school_id' => 'user_id']);
    }

    /**
     * Gets query for [[SchoolStudies]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchoolStudies()
    {
        return $this->hasMany(SchoolStudy::class, ['school_id' => 'user_id']);
    }

    /**
     * Gets query for [[StudentPreviousSchools]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getStudentPreviousSchools()
    {
        return $this->hasMany(StudentPreviousSchool::class, ['school_id' => 'user_id']);
    }
}
