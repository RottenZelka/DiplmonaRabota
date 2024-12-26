<?php

use yii\db\Migration;

/**
 * Class m241226_175534_add_periods_and_school_attr
 */
class m241226_175534_add_periods_and_school_attr extends Migration
{
    public function safeUp()
    {
        // Add new columns to the `school` table
        $this->addColumn('{{%school}}', 'user_id', $this->integer()->notNull()->after('profile_photo_id'));
        $this->addColumn('{{%school}}', 'school_year_start', $this->date());
        $this->addColumn('{{%school}}', 'school_year_end', $this->date());
        $this->addColumn('{{%school}}', 'primary_color', $this->string(7)->defaultValue('#ffffff'));
        $this->addColumn('{{%school}}', 'secondary_color', $this->string(7)->defaultValue('#000000'));
        $this->addColumn('{{%school}}', 'font_color', $this->string(7)->defaultValue('#333333'));

        // // Add foreign key for `user_id`
        $this->addForeignKey(
            'fk-school-user_id',
            '{{%school}}',
            'user_id',
            '{{%user}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        // Create the `period` table
        $this->createTable('{{%period}}', [
            'id' => $this->primaryKey(),
            'school_id' => $this->integer()->notNull(),
            'name' => $this->string(255)->notNull(),
            'start_date' => $this->date()->notNull()->defaultValue("2000-01-01"),
            'end_date' => $this->date()->notNull()->defaultValue("2000-01-01"),
            'is_vacation' => $this->boolean()->defaultValue(false),
        ]);

        // Add foreign key for `school_id` in `period` table
        $this->addForeignKey(
            'fk-period-school_id',
            '{{%period}}',
            'school_id',
            '{{%school}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        
    }

    public function safeDown()
    {
        // Drop foreign key and columns from the `school` table
        $this->dropForeignKey('fk-school-user_id', '{{%school}}');
        $this->dropColumn('{{%school}}', 'user_id');
        $this->dropColumn('{{%school}}', 'school_year_start');
        $this->dropColumn('{{%school}}', 'school_year_end');
        $this->dropColumn('{{%school}}', 'primary_color');
        $this->dropColumn('{{%school}}', 'secondary_color');
        $this->dropColumn('{{%school}}', 'font_color');

        // Drop `period` table
        $this->dropForeignKey('fk-period-school_id', '{{%period}}');
        $this->dropTable('{{%period}}');
    }
}
