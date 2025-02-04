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

        // Add the application_id foreign key
        $this->addColumn('{{%links}}', 'application_id', $this->integer()->null());
        $this->addForeignKey('fk_links_application', '{{%links}}', 'application_id', '{{%applications}}', 'id', 'SET NULL', 'CASCADE');
        
        $this->addColumn('{{%links}}', 'question_id', $this->integer()->null());
        $this->addForeignKey('fk_links_question', '{{%links}}', 'question_id', '{{%exam_questions}}', 'id', 'SET NULL', 'CASCADE');
        
        $this->addColumn('{{%links}}', 'answer_id', $this->integer()->null());
        $this->addForeignKey('fk_links_answer', '{{%links}}', 'answer_id', '{{%student_answers}}', 'id', 'SET NULL', 'CASCADE');

        $this->dropColumn('{{%applications}}', 'file_field');
        $this->dropForeignKey('fk-student_answers-answer_id', '{{%student_answers}}');
        $this->dropColumn('{{%student_answers}}', 'answer_id');
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
