<?php

use yii\db\Migration;

/**
 * Class m241210_064104_remove_session_table
 */
class m241210_064104_remove_session_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->dropIndex('idx-session-expire', '{{%session}}');
        $this->dropPrimaryKey('pk-session-id', '{{%session}}');
        $this->dropTable('{{%session}}');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
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

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m241210_064104_remove_session_table cannot be reverted.\n";

        return false;
    }
    */
}
