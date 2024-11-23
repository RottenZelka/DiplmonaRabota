<?php

use yii\db\Migration;

/**
 * Class m241123_092807_add_user_type_enum
 */
class m241123_092807_add_user_type_enum extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->alterColumn('users', 'user_type', "ENUM('school', 'student') NOT NULL");
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->alterColumn('users', 'user_type', $this->string(255)->notNull());
    }
}
