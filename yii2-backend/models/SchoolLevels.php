<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%school_levels}}".
 *
 * @property int $id
 * @property string $name
 *
 * @property SchoolLevelAssignment[] $schoolLevelAssignments
 */
class SchoolLevels extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%school_levels}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['name'], 'string', 'max' => 100],
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
        ];
    }

    /**
     * Gets query for [[SchoolLevelAssignments]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getSchoolLevelAssignments()
    {
        return $this->hasMany(SchoolLevelAssignment::class, ['level_id' => 'id']);
    }
}
