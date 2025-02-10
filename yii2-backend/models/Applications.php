<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%applications}}".
 *
 * @property int $id
 * @property int $student_id
 * @property int $school_id
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property string|null $text_field
 * @property string $expiration_date
 * @property string $status
 * @property string $start_date
 *
 * @property Links $fileField
 * @property Links[] $links
 * @property School $school
 * @property Student $student
 */
class Applications extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%applications}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['student_id', 'school_id', 'expiration_date'], 'required'],
            [['student_id', 'school_id'], 'integer'],
            [['created_at', 'updated_at', 'expiration_date', 'start_date'], 'safe'],
            [['text_field', 'status'], 'string'],
            [['school_id'], 'exist', 'skipOnError' => true, 'targetClass' => School::class, 'targetAttribute' => ['school_id' => 'user_id']],
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
            'school_id' => 'School ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'text_field' => 'Text Field',
            'expiration_date' => 'Expiration Date',
            'status' => 'Status',
            'start_date' => 'Start Date',
        ];
    }

    /**
     * Gets query for [[Links]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getLinks()
    {
        return $this->hasMany(Links::class, ['application_id' => 'id']);
    }

    /**
     * Gets query for [[School]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchool()
    {
        return $this->hasOne(School::class, ['user_id' => 'school_id']);
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
