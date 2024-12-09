<?php

use yii\db\Migration;

/**
 * Class m241205_143416_create_student_and_school_tables
 */
class m241205_143416_create_student_and_school_tables extends Migration
{
    public function safeUp()
    {
        // Create `school` table
        if ($this->db->getSchema()->getTableSchema('{{%school}}') === null) {
            $this->createTable('{{%school}}', [
                'id' => $this->primaryKey(),
                'name' => $this->string(255)->notNull(),
                'address' => $this->string(255)->null(),
                'description' => $this->text()->null(),
                'profile_photo_id' => $this->integer()->null(),
                'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
                'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            ]);
        }

        // Create `student` table
        if ($this->db->getSchema()->getTableSchema('{{%student}}') === null) {
            $this->createTable('{{%student}}', [
                'id' => $this->primaryKey(),
                'user_id' => $this->integer()->notNull(),
                'name' => $this->string(255)->notNull(),
                'age' => $this->integer()->null(),
                'profile_photo_id' => $this->integer()->null(),
                'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
                'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            ]);
        }

        $this->addForeignKey(
            'fk-student-user_id',
            '{{%student}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE'
        );

        // Create `school_levels` table
        if ($this->db->getSchema()->getTableSchema('{{%school_levels}}') === null) {
            $this->createTable('{{%school_levels}}', [
                'id' => $this->primaryKey(),
                'name' => $this->string(100)->notNull(),
            ]);
        }

        // Create `school_level_assignments` table
        if ($this->db->getSchema()->getTableSchema('{{%school_level_assignments}}') === null) {
            $this->createTable('{{%school_level_assignments}}', [
                'id' => $this->primaryKey(),
                'school_id' => $this->integer()->notNull(),
                'level_id' => $this->integer()->notNull(),
            ]);
        }

        $this->addForeignKey(
            'fk-school_level_assignments-school_id',
            '{{%school_level_assignments}}',
            'school_id',
            '{{%school}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-school_level_assignments-level_id',
            '{{%school_level_assignments}}',
            'level_id',
            '{{%school_levels}}',
            'id',
            'CASCADE'
        );

        // Create `studies` table
        if ($this->db->getSchema()->getTableSchema('{{%studies}}') === null) {
            $this->createTable('{{%studies}}', [
                'id' => $this->primaryKey(),
                'name' => $this->string(255)->notNull(),
            ]);
        }

        // Create `school_studies` table
        if ($this->db->getSchema()->getTableSchema('{{%school_studies}}') === null) {
            $this->createTable('{{%school_studies}}', [
                'id' => $this->primaryKey(),
                'school_id' => $this->integer()->notNull(),
                'study_id' => $this->integer()->notNull(),
            ]);
        }

        $this->addForeignKey(
            'fk-school_studies-school_id',
            '{{%school_studies}}',
            'school_id',
            '{{%school}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-school_studies-study_id',
            '{{%school_studies}}',
            'study_id',
            '{{%studies}}',
            'id',
            'CASCADE'
        );

        // Create `user_studies` table
        if ($this->db->getSchema()->getTableSchema('{{%user_studies}}') === null) {
            $this->createTable('{{%user_studies}}', [
                'id' => $this->primaryKey(),
                'user_id' => $this->integer()->notNull(),
                'study_id' => $this->integer()->notNull(),
            ]);
        }

        $this->addForeignKey(
            'fk-user_studies-user_id',
            '{{%user_studies}}',
            'user_id',
            '{{%users}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-user_studies-study_id',
            '{{%user_studies}}',
            'study_id',
            '{{%studies}}',
            'id',
            'CASCADE'
        );

        // Create `images` table
        if ($this->db->getSchema()->getTableSchema('{{%images}}') === null) {
            $this->createTable('{{%images}}', [
                'id' => $this->primaryKey(),
                'url' => $this->string(255)->notNull(),
            ]);
        }

        // Add profile_photo_id foreign keys
        $this->addForeignKey(
            'fk-school-profile_photo_id',
            '{{%school}}',
            'profile_photo_id',
            '{{%images}}',
            'id',
            'SET NULL'
        );

        $this->addForeignKey(
            'fk-student-profile_photo_id',
            '{{%student}}',
            'profile_photo_id',
            '{{%images}}',
            'id',
            'SET NULL'
        );

        // Create `school_album` table
        if ($this->db->getSchema()->getTableSchema('{{%school_album}}') === null) {
            $this->createTable('{{%school_album}}', [
                'id' => $this->primaryKey(),
                'school_id' => $this->integer()->notNull(),
                'image_id' => $this->integer()->notNull(),
            ]);
        }

        $this->addForeignKey(
            'fk-school_album-school_id',
            '{{%school_album}}',
            'school_id',
            '{{%school}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-school_album-image_id',
            '{{%school_album}}',
            'image_id',
            '{{%images}}',
            'id',
            'CASCADE'
        );

        // Create `links` table
        if ($this->db->getSchema()->getTableSchema('{{%links}}') === null) {
            $this->createTable('{{%links}}', [
                'id' => $this->primaryKey(),
                'url' => $this->string(255)->notNull(),
            ]);
        }

        // Create `saved_schools` table
        if ($this->db->getSchema()->getTableSchema('{{%saved_schools}}') === null) {
            $this->createTable('{{%saved_schools}}', [
                'id' => $this->primaryKey(),
                'student_id' => $this->integer()->notNull(),
                'school_id' => $this->integer()->notNull(),
            ]);
        }

        $this->addForeignKey(
            'fk-saved_schools-student_id',
            '{{%saved_schools}}',
            'student_id',
            '{{%student}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-saved_schools-school_id',
            '{{%saved_schools}}',
            'school_id',
            '{{%school}}',
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

        // Create `exams` table
        if ($this->db->getSchema()->getTableSchema('{{%exams}}') === null) {
            $this->createTable('{{%exams}}', [
                'id' => $this->primaryKey(),
                'school_id' => $this->integer()->notNull(),
                'name' => $this->string(255)->notNull(),
                'time_needed_minutes' => $this->integer()->notNull(),
                'is_mandatory' => $this->boolean()->defaultValue(false),
                'type' => $this->string(50)->notNull(),
                'study_id' => $this->integer()->null(),
                'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
                'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            ]);
        }

        $this->addForeignKey(
            'fk-exams-school_id',
            '{{%exams}}',
            'school_id',
            '{{%school}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-exams-study_id',
            '{{%exams}}',
            'study_id',
            '{{%studies}}',
            'id',
            'SET NULL'
        );

        // Create `exam_questions` table
        if ($this->db->getSchema()->getTableSchema('{{%exam_questions}}') === null) {
            $this->createTable('{{%exam_questions}}', [
                'id' => $this->primaryKey(),
                'exam_id' => $this->integer()->notNull(),
                'question_text' => $this->text()->notNull(),
                'type' => $this->string(50)->notNull(), // e.g., 'multiple_choice', 'text', 'photo'
                'choices' => $this->text()->null(), // JSON for multiple-choice options
                'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
                'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            ]);
        }

        $this->addForeignKey(
            'fk-exam_questions-exam_id',
            '{{%exam_questions}}',
            'exam_id',
            '{{%exams}}',
            'id',
            'CASCADE'
        );

        // Create `student_exams` table
        if ($this->db->getSchema()->getTableSchema('{{%student_exams}}') === null) {
            $this->createTable('{{%student_exams}}', [
                'id' => $this->primaryKey(),
                'student_id' => $this->integer()->notNull(),
                'exam_id' => $this->integer()->notNull(),
                'status' => $this->string(50)->notNull(), // 'pending', 'passed', 'failed'
                'checked_at' => $this->timestamp()->null(),
                'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
            ]);
        }

        $this->addForeignKey(
            'fk-student_exams-student_id',
            '{{%student_exams}}',
            'student_id',
            '{{%student}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-student_exams-exam_id',
            '{{%student_exams}}',
            'exam_id',
            '{{%exams}}',
            'id',
            'CASCADE'
        );

        // Create `applications` table
        if ($this->db->getSchema()->getTableSchema('{{%applications}}') === null) {
            $this->createTable('{{%applications}}', [
                'id' => $this->primaryKey(),
                'student_id' => $this->integer()->notNull(),
                'school_id' => $this->integer()->notNull(),
                'status' => $this->string(50)->notNull(), // 'accepted', 'pending', 'rejected'
                'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
                'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            ]);
        }

        $this->addForeignKey(
            'fk-applications-student_id',
            '{{%applications}}',
            'student_id',
            '{{%student}}',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-applications-school_id',
            '{{%applications}}',
            'school_id',
            '{{%school}}',
            'id',
            'CASCADE'
        );

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
    }

    public function safeDown()
    {
        // Drop `post_images` table first because it depends on `posts` and `images`
        $this->dropForeignKey('fk-post_images-image_id', '{{%post_images}}');
        $this->dropForeignKey('fk-post_images-post_id', '{{%post_images}}');
        $this->dropTable('{{%post_images}}');

        // Drop `posts` table
        $this->dropForeignKey('fk-posts-user_id', '{{%posts}}');
        $this->dropTable('{{%posts}}');

        // Drop `applications` table
        $this->dropForeignKey('fk-applications-school_id', '{{%applications}}');
        $this->dropForeignKey('fk-applications-student_id', '{{%applications}}');
        $this->dropTable('{{%applications}}');

        // Drop `student_exams` table
        $this->dropForeignKey('fk-student_exams-exam_id', '{{%student_exams}}');
        $this->dropForeignKey('fk-student_exams-student_id', '{{%student_exams}}');
        $this->dropTable('{{%student_exams}}');

        // Drop `exam_questions` table
        $this->dropForeignKey('fk-exam_questions-exam_id', '{{%exam_questions}}');
        $this->dropTable('{{%exam_questions}}');

        // Drop `exams` table
        $this->dropForeignKey('fk-exams-study_id', '{{%exams}}');
        $this->dropForeignKey('fk-exams-school_id', '{{%exams}}');
        $this->dropTable('{{%exams}}');

        // Drop `student_previous_schools` table
        $this->dropForeignKey('fk-student_previous_schools-school_id', '{{%student_previous_schools}}');
        $this->dropForeignKey('fk-student_previous_schools-student_id', '{{%student_previous_schools}}');
        $this->dropTable('{{%student_previous_schools}}');

        // Drop `saved_schools` table
        $this->dropForeignKey('fk-saved_schools-school_id', '{{%saved_schools}}');
        $this->dropForeignKey('fk-saved_schools-student_id', '{{%saved_schools}}');
        $this->dropTable('{{%saved_schools}}');

        // Drop `links` table
        $this->dropTable('{{%links}}');

        // Drop `school_album` table
        $this->dropForeignKey('fk-school_album-image_id', '{{%school_album}}');
        $this->dropForeignKey('fk-school_album-school_id', '{{%school_album}}');
        $this->dropTable('{{%school_album}}');

        // Drop foreign key for profile_photo_id in `student` and `school`
        $this->dropForeignKey('fk-student-profile_photo_id', '{{%student}}');
        $this->dropForeignKey('fk-school-profile_photo_id', '{{%school}}');

        // Drop `images` table
        $this->dropTable('{{%images}}');

        // Drop `user_studies` table
        $this->dropForeignKey('fk-user_studies-study_id', '{{%user_studies}}');
        $this->dropForeignKey('fk-user_studies-user_id', '{{%user_studies}}');
        $this->dropTable('{{%user_studies}}');

        // Drop `school_studies` table
        $this->dropForeignKey('fk-school_studies-study_id', '{{%school_studies}}');
        $this->dropForeignKey('fk-school_studies-school_id', '{{%school_studies}}');
        $this->dropTable('{{%school_studies}}');

        // Drop `studies` table
        $this->dropTable('{{%studies}}');

        // Drop `school_level_assignments` table
        $this->dropForeignKey('fk-school_level_assignments-level_id', '{{%school_level_assignments}}');
        $this->dropForeignKey('fk-school_level_assignments-school_id', '{{%school_level_assignments}}');
        $this->dropTable('{{%school_level_assignments}}');

        // Drop `school_levels` table
        $this->dropTable('{{%school_levels}}');

        // Drop `student` table
        $this->dropForeignKey('fk-student-user_id', '{{%student}}');
        $this->dropTable('{{%student}}');

        // Drop `school` table
        $this->dropTable('{{%school}}');
    }

}