<?php

use yii\db\Migration;

/**
 * Class m241125_135959_session_table
 */
class m241125_135959_session_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%session}}', [
            'id' => $this->char(40)->notNull(),
            'expire' => $this->integer()->notNull(),
            'data' => $this->binary(),
        ]);

        // Add primary key
        $this->addPrimaryKey('pk-session-id', '{{%session}}', 'id');

        // Add index on expire to optimize cleanup
        $this->createIndex('idx-session-expire', '{{%session}}', 'expire');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropIndex('idx-session-expire', '{{%session}}');
        $this->dropPrimaryKey('pk-session-id', '{{%session}}');
        $this->dropTable('{{%session}}');
    }
}
