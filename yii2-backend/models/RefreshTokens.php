<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "{{%refresh_tokens}}".
 *
 * @property int $id
 * @property int $user_id
 * @property string $token
 * @property int $expires_at
 * @property int $created_at
 * @property int $updated_at
 *
 * @property Users $user
 */
class RefreshTokens extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%refresh_tokens}}';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['user_id', 'token', 'expires_at', 'created_at', 'updated_at'], 'required'],
            [['user_id', 'expires_at', 'created_at', 'updated_at'], 'integer'],
            [['token'], 'string', 'max' => 512],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'token' => 'Token',
            'expires_at' => 'Expires At',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
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
