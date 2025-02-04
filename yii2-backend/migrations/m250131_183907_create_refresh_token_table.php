<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%refresh_token}}`.
 */
class m250131_183907_create_refresh_token_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('refresh_tokens', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'token' => $this->string(512)->notNull(),
            'expires_at' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        // Add foreign key to users table
        $this->addForeignKey(
            'fk-refresh_tokens-user_id',
            'refresh_tokens',
            'user_id',
            'users',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk-refresh_tokens-user_id', 'refresh_tokens');
        $this->dropTable('refresh_tokens');
    }
}
