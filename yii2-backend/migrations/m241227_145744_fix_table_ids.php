<?php

use yii\db\Migration;

/**
 * Class m241227_145744_fix_table_ids
 */
class m241227_145744_fix_table_ids extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Drop existing foreign keys
        $this->dropForeignKey('fk-school_level_assignments-school_id', '{{%school_level_assignments}}');
        $this->dropForeignKey('fk-school_album-school_id', '{{%school_album}}');
        $this->dropForeignKey('fk-saved_schools-student_id', '{{%saved_schools}}');
        $this->dropForeignKey('fk-saved_schools-school_id', '{{%saved_schools}}');
        $this->dropForeignKey('fk-student_previous_schools-student_id', '{{%student_previous_schools}}');
        $this->dropForeignKey('fk-student_previous_schools-school_id', '{{%student_previous_schools}}');
        $this->dropForeignKey('fk-exams-school_id', '{{%exams}}');
        $this->dropForeignKey('fk-student_exams-student_id', '{{%student_exams}}');
        $this->dropForeignKey('fk-applications-student_id', '{{%applications}}');
        $this->dropForeignKey('fk-applications-school_id', '{{%applications}}');
        $this->dropForeignKey('fk-period-school_id', '{{%period}}');
        // Drop the `id` column
        $this->dropColumn('{{%school}}', 'id');

        // Add primary key to `user_id`
        $this->addPrimaryKey('pk-school-user_id', '{{%school}}', 'user_id');

        // Drop the `id` column
        $this->dropColumn('{{%student}}', 'id');

        // Add primary key to `user_id`
        $this->addPrimaryKey('pk-student-user_id', '{{%student}}', 'user_id');

        // Add foreign keys again with existing column names
        $this->addForeignKey(
            'fk-school_level_assignments-school_id',
            '{{%school_level_assignments}}',
            'school_id',
            '{{%school}}',
            'user_id', // updated reference column
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-school_album-school_id',
            '{{%school_album}}',
            'school_id',
            '{{%school}}',
            'user_id', // updated reference column
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-saved_schools-student_id',
            '{{%saved_schools}}',
            'student_id',
            '{{%student}}',
            'user_id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-saved_schools-school_id',
            '{{%saved_schools}}',
            'school_id',
            '{{%school}}',
            'user_id', // updated reference column
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-student_previous_schools-student_id',
            '{{%student_previous_schools}}',
            'student_id',
            '{{%student}}',
            'user_id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-student_previous_schools-school_id',
            '{{%student_previous_schools}}',
            'school_id',
            '{{%school}}',
            'user_id', // updated reference column
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-exams-school_id',
            '{{%exams}}',
            'school_id',
            '{{%school}}',
            'user_id', // updated reference column
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-student_exams-student_id',
            '{{%student_exams}}',
            'student_id',
            '{{%student}}',
            'user_id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-applications-student_id',
            '{{%applications}}',
            'student_id',
            '{{%student}}',
            'user_id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-applications-school_id',
            '{{%applications}}',
            'school_id',
            '{{%school}}',
            'user_id', // updated reference column
            'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m241227_145744_fix_table_ids cannot be reverted.\n";

        return false;
    }
}
