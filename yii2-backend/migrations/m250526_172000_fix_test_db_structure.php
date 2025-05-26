<?php

use yii\db\Migration;

/**
 * Class m250526_172000_fix_test_db_structure
 */
class m250526_172000_fix_test_db_structure extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Drop username column from users table if it exists
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%users}}');
        if ($tableSchema !== null && isset($tableSchema->columns['username'])) {
            $this->dropColumn('{{%users}}', 'username');
        }

        // Drop type column from exam_questions table if it exists
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%exam_questions}}');
        if ($tableSchema !== null && isset($tableSchema->columns['type'])) {
            $this->dropColumn('{{%exam_questions}}', 'type');
        }

        // Fix foreign key constraints
        // Drop and recreate school-user_id foreign key without ON UPDATE CASCADE
        $this->dropForeignKey('fk-school-user_id', '{{%school}}');
        $this->addForeignKey(
            'fk-school-user_id',
            '{{%school}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE'
        );

        // Drop and recreate student-user_id foreign key with ON UPDATE CASCADE
        $this->dropForeignKey('fk-student-user_id', '{{%student}}');
        $this->addForeignKey(
            'fk-student-user_id',
            '{{%student}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        // Add back username column to users table
        $this->addColumn('{{%users}}', 'username', $this->string(255)->notNull());

        // Add back type column to exam_questions table
        $this->addColumn('{{%exam_questions}}', 'type', $this->string(50)->notNull());

        // Restore original foreign key constraints
        // Drop and recreate school-user_id foreign key with ON UPDATE CASCADE
        $this->dropForeignKey('fk-school-user_id', '{{%school}}');
        $this->addForeignKey(
            'fk-school-user_id',
            '{{%school}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        // Drop and recreate student-user_id foreign key without ON UPDATE CASCADE
        $this->dropForeignKey('fk-student-user_id', '{{%student}}');
        $this->addForeignKey(
            'fk-student-user_id',
            '{{%student}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE'
        );
    }
} 