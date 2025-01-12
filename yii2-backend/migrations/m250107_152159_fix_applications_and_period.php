<?php

use yii\db\Migration;

/**
 * Class m250107_152159_fix_applications_and_period
 */
class m250107_152159_fix_applications_and_period extends Migration
{
    public function safeUp()
    {
        // Add columns to the `applications` table
        $this->addColumn('{{%applications}}', 'text_field', $this->text()->null());
        $this->addColumn('{{%applications}}', 'file_field', $this->integer()->null());
        $this->addColumn('{{%applications}}', 'expiration_date', $this->date()->notNull());
        $this->dropColumn('{{%applications}}', 'status');
        $this->addColumn('{{%applications}}', 'status', "ENUM('approved', 'pending', 'denied', 'invited') NOT NULL DEFAULT 'pending'");

        $this->addForeignKey(
            'fk-applications-file_field',
            '{{%applications}}',
            'file_field',
            '{{%links}}',
            'id',
            'CASCADE'
        );

        // Add trigger logic to delete expired applications
        $this->execute("
            CREATE EVENT IF NOT EXISTS delete_expired_applications
            ON SCHEDULE EVERY 1 DAY
            DO
                DELETE FROM {{%applications}}
                WHERE (status IN ('approved', 'denied')) AND expiration_date < DATE_SUB(NOW(), INTERVAL 7 DAY)
        ");

        
        $this->dropTable('{{%period}}');

        // Add period constraints to `school`
        $this->createTable('{{%period}}', [
            'id' => $this->primaryKey(),
            'school_id' => $this->integer()->notNull(),
            'name' => $this->string(255)->notNull()->defaultValue(''),
            'start_date' => $this->date()->notNull(),
            'end_date' => $this->date()->notNull(),
            'type' => "ENUM('vacation', 'student studied from to', 'school year', 'application', 'other', 'event') DEFAULT 'school year'",
            'other_type' => $this->text()->null(),
        ]);

        $this->addForeignKey(
            'fk-period-school_id',
            '{{%period}}',
            'school_id',
            '{{%school}}',
            'user_id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        // Drop the foreign key for 'file_field' column in 'applications'
        $this->dropForeignKey('fk-applications-file_field', '{{%applications}}');

        // Drop the 'status' column after changing it to ENUM
        $this->dropColumn('{{%applications}}', 'status');

        // Add the 'status' column back to its original state
        $this->addColumn('{{%applications}}', 'status', $this->string()->notNull());

        // Drop the 'file_field' column
        $this->dropColumn('{{%applications}}', 'file_field');

        // Drop the 'text_field' column
        $this->dropColumn('{{%applications}}', 'text_field');

        // Drop the 'expiration_date' column
        $this->dropColumn('{{%applications}}', 'expiration_date');

        // Drop the 'delete_expired_applications' event
        $this->execute("DROP EVENT IF EXISTS delete_expired_applications");

        // Recreate the 'period' table that was dropped
        $this->createTable('{{%period}}', [
            'id' => $this->primaryKey(),
            'school_id' => $this->integer()->notNull(),
            'start_date' => $this->date()->notNull(),
            'end_date' => $this->date()->notNull(),
            'type' => "ENUM('vacation', 'student studied from to', 'school year', 'application', 'other') DEFAULT 'school year'",
            'other_typr' => $this->text()->null(),
        ]);

        // Recreate the foreign key for the 'period' table
        $this->addForeignKey(
            'fk-period-school_id',
            '{{%period}}',
            'school_id',
            '{{%school}}',
            'user_id',
            'CASCADE',
            'CASCADE'
        );
    }

}
