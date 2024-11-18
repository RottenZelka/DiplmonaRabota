<?php
namespace app\models;

use yii\db\ActiveRecord;

class User extends ActiveRecord
{
    
    public static function primaryKey()
    {
        return ['id']; // Change this to your actual primary key column name
    }
    /**
     * Specifies the name of the database table associated with this ActiveRecord class.
     */
    public static function tableName()
    {
        return 'user'; // Make sure this matches your actual table name
    }

    /**
     * Retrieves all users from the database.
     *
     * @return array|ActiveRecord[]
     */
    public static function findAllUsers()
    {
        // This will only work if User extends ActiveRecord
        return self::find()->all();
    }

    /**
     * Retrieves a user by ID.
     *
     * @param int $id
     * @return static|null
     */
    public static function findUserById($id)
    {
        return self::findOne($id);
    }
}
