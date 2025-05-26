<?php

use yii\db\Migration;

/**
 * Class m250203_154230_add_option_for_multiple_files
 */
class m250203_154230_add_option_for_multiple_files extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Remove the 'address' field from the enum and add the new fields
        $this->execute("ALTER TABLE {{%links}} MODIFY COLUMN `type` ENUM('Profile Image', 'Album', 'File', 'Application', 'Profile File', 'Question', 'Answer') NOT NULL");

        // Check if the application_id column exists in the links table before adding it
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%links}}');
        if ($tableSchema === null || !isset($tableSchema->columns['application_id'])) {
            $this->addColumn('{{%links}}', 'application_id', $this->integer()->null());
        }
        // Check if the foreign key already exists before adding it
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%links}}');
        if ($tableSchema === null || !isset($tableSchema->foreignKeys['fk_links_application'])) {
            $this->addForeignKey('fk_links_application', '{{%links}}', 'application_id', '{{%applications}}', 'id', 'SET NULL', 'CASCADE');
        }
        
        // Check if the column already exists before adding it
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%links}}');
        if ($tableSchema === null || !isset($tableSchema->columns['question_id'])) {
            $this->addColumn('{{%links}}', 'question_id', $this->integer()->null());
        }
        // Check if the foreign key already exists before adding it
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%links}}');
        if ($tableSchema === null || !isset($tableSchema->foreignKeys['fk_links_question'])) {
            $this->addForeignKey('fk_links_question', '{{%links}}', 'question_id', '{{%exam_questions}}', 'id', 'SET NULL', 'CASCADE');
        }
        
        // Check if the column already exists before adding it
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%links}}');
        if ($tableSchema === null || !isset($tableSchema->columns['answer_id'])) {
            $this->addColumn('{{%links}}', 'answer_id', $this->integer()->null());
        }
        // Check if the foreign key already exists before adding it
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%links}}');
        if ($tableSchema === null || !isset($tableSchema->foreignKeys['fk_links_answer'])) {
            $this->addForeignKey('fk_links_answer', '{{%links}}', 'answer_id', '{{%student_answers}}', 'id', 'SET NULL', 'CASCADE');
        }

        // Check and drop foreign key from applications
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%applications}}');
        if ($tableSchema !== null && isset($tableSchema->foreignKeys['fk-applications-file_field'])) {
            $this->dropForeignKey('fk-applications-file_field', '{{%applications}}');
        }
        if ($tableSchema !== null && isset($tableSchema->columns['file_field'])) {
            $this->dropColumn('{{%applications}}', 'file_field');
        }

        // Check and drop foreign key from student_answers
        $tableSchema = $this->db->getSchema()->getTableSchema('{{%student_answers}}');
        if ($tableSchema !== null && isset($tableSchema->foreignKeys['fk-student_answers-answer_id'])) {
            $this->dropForeignKey('fk-student_answers-answer_id', '{{%student_answers}}');
        }
        if ($tableSchema !== null && isset($tableSchema->columns['answer_id'])) {
            $this->dropColumn('{{%student_answers}}', 'answer_id');
        }
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        // Remove the application_id foreign key
        $this->dropForeignKey('fk_links_application', '{{%links}}');
        $this->dropColumn('{{%links}}', 'application_id');

        // Add the 'address' field back to the enum
        $this->execute("ALTER TABLE {{%links}} MODIFY COLUMN `type` ENUM('Profile Image', 'Album', 'File', 'Address') NOT NULL");
    }
}
