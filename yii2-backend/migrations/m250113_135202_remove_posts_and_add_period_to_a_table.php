<?php

use yii\db\Migration;

/**
 * Class m250113_135202_remove_posts_and_add_period_to_a_table
 */
class m250113_135202_remove_posts_and_add_period_to_a_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Drop foreign key for posts table
        $this->dropForeignKey('fk-posts-links_id', '{{%posts}}');

        // Drop posts table
        $this->dropTable('{{%posts}}');

        // Drop `student_previous_schools` table
        $this->dropForeignKey('fk-student_previous_schools-school_id', '{{%student_previous_schools}}');
        $this->dropForeignKey('fk-student_previous_schools-student_id', '{{%student_previous_schools}}');
        $this->dropTable('{{%student_previous_schools}}');

        $this->addColumn('{{%period}}', 'student_id', $this->integer()->null());

        $this->addForeignKey(
            'fk-period-student_id',
            '{{%period}}',
            'student_id',
            '{{%student}}',
            'user_id',
            'CASCADE'
        );

        $this->addColumn('{{%applications}}', 'start_date', $this->dateTime()->notNull()->defaultValue('CURRENT_TIMESTAMP'));
        $this->alterColumn('{{%period}}', 'end_date', $this->date()->null());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        // Create unified `posts` table
        if ($this->db->getSchema()->getTableSchema('{{%posts}}') === null) {
            $this->createTable('{{%posts}}', [
                'id' => $this->primaryKey(),
                'user_id' => $this->integer()->notNull(), // Linked to users table
                'title' => $this->string(255)->notNull(),
                'content' => $this->text()->notNull(),
                'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
                'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            ]);
        }

        $this->addForeignKey(
            'fk-posts-user_id',
            '{{%posts}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE'
        );

        // Update `posts` table to support images
        if ($this->db->getSchema()->getTableSchema('{{%post_images}}') === null) {
            $this->createTable('{{%post_images}}', [
                'id' => $this->primaryKey(),
                'post_id' => $this->integer()->notNull(),
                'image_id' => $this->integer()->notNull(),
            ]);
        }

        $this->addForeignKey(
            'fk-post_images-post_id',
            '{{%post_images}}',
            'post_id',
            '{{%posts}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-post_images-image_id',
            '{{%post_images}}',
            'image_id',
            '{{%images}}',
            'id',
            'CASCADE'
        );

        // Create `student_previous_schools` table
        if ($this->db->getSchema()->getTableSchema('{{%student_previous_schools}}') === null) {
            $this->createTable('{{%student_previous_schools}}', [
                'id' => $this->primaryKey(),
                'student_id' => $this->integer()->notNull(),
                'school_id' => $this->integer()->notNull(), #make from which year to which he has studied
            ]);
        }

        $this->addForeignKey(
            'fk-student_previous_schools-student_id',
            '{{%student_previous_schools}}',
            'student_id',
            '{{%student}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-student_previous_schools-school_id',
            '{{%student_previous_schools}}',
            'school_id',
            '{{%school}}',
            'id',
            'CASCADE'
        );
    }
}
