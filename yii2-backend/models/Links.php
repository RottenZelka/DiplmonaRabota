<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%links}}".
 *
 * @property int $id
 * @property string $url
 * @property string $type
 *
 * @property Posts[] $posts
 * @property SchoolAlbum[] $schoolAlbums
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
            [['url'], 'required'],
            [['type'], 'string'],
            [['url'], 'string', 'max' => 255],
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
        ];
    }

    /**
     * Gets query for [[Posts]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getPosts()
    {
        return $this->hasMany(Posts::class, ['user_id' => 'id']);
    }

    /**
     * Gets query for [[SchoolAlbums]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchoolAlbums()
    {
        return $this->hasMany(SchoolAlbum::class, ['image_id' => 'id']);
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
