<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%school}}".
 *
 * @property string $name
 * @property string|null $address
 * @property string|null $description
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property int $user_id
 * @property string|null $school_year_start
 * @property string|null $school_year_end
 * @property string|null $primary_color
 * @property string|null $secondary_color
 * @property int|null $profile_photo_id
 *
 * @property Applications[] $applications
 * @property Exams[] $exams
 * @property Links[] $links
 * @property Period[] $periods
 * @property Links $profilePhoto
 * @property SavedSchools[] $savedSchools
 * @property SchoolLevelAssignments[] $schoolLevelAssignments
 * @property Users $user
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
            [['name', 'user_id'], 'required'],
            [['description'], 'string'],
            [['created_at', 'updated_at', 'school_year_start', 'school_year_end'], 'safe'],
            [['user_id', 'profile_photo_id'], 'integer'],
            [['name', 'address'], 'string', 'max' => 255],
            [['primary_color', 'secondary_color'], 'string', 'max' => 7],
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
            'name' => 'Name',
            'address' => 'Address',
            'description' => 'Description',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'user_id' => 'User ID',
            'school_year_start' => 'School Year Start',
            'school_year_end' => 'School Year End',
            'primary_color' => 'Primary Color',
            'secondary_color' => 'Secondary Color',
            'profile_photo_id' => 'Profile Photo ID',
        ];
    }

    /**
     * Gets query for [[Applications]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getApplications()
    {
        return $this->hasMany(Applications::class, ['school_id' => 'user_id']);
    }

    /**
     * Gets query for [[Exams]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getExams()
    {
        return $this->hasMany(Exams::class, ['school_id' => 'user_id']);
    }

    /**
     * Gets query for [[Links]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getLinks()
    {
        return $this->hasMany(Links::class, ['author_id' => 'user_id']);
    }

    /**
     * Gets query for [[Periods]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getPeriods()
    {
        return $this->hasMany(Period::class, ['school_id' => 'user_id']);
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
        return $this->hasMany(SavedSchools::class, ['school_id' => 'user_id']);
    }

    /**
     * Gets query for [[SchoolLevelAssignments]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchoolLevelAssignments()
    {
        return $this->hasMany(SchoolLevelAssignments::class, ['school_id' => 'user_id']);
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
