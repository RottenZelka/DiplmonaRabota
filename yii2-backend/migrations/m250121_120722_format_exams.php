<?php

use yii\db\Migration;

/**
 * Class m250121_120722_format_exams
 */
class m250121_120722_format_exams extends Migration
{
    public function safeUp()
    {
        $this->dropTable('{{%school_album}}');
        // 1. Remove the 'type' column from 'exams' table
        $this->dropColumn('{{%exams}}', 'type');

        // 2. Add 'question_type' ENUM column to 'exam_questions' table
        $this->addColumn(
            '{{%exam_questions}}',
            'question_type',
            "ENUM('MCQ', 'TTA', 'LTA', 'FAR') NOT NULL DEFAULT 'MCQ'"
        );

        // 3. Add 'correct_answer' column to 'exam_questions' table
        $this->addColumn('{{%exam_questions}}', 'correct_answer', $this->text()->null());

        // 4. Create 'student_answers' table
        $this->createTable('{{%student_answers}}', [
            'id' => $this->primaryKey(),
            'student_id' => $this->integer()->notNull(),
            'exam_id' => $this->integer()->notNull(),
            'question_id' => $this->integer()->notNull(),
            'answer' => $this->text()->null(),
            'answer_id' => $this->integer()->null(),
            'created_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
            'updated_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        ]);

        // Add foreign keys for 'student_answers'
        $this->addForeignKey(
            'fk-student_answers-student_id',
            '{{%student_answers}}',
            'student_id',
            '{{%student}}',
            'user_id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-student_answers-exam_id',
            '{{%student_answers}}',
            'exam_id',
            '{{%exams}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-student_answers-question_id',
            '{{%student_answers}}',
            'question_id',
            '{{%exam_questions}}',
            'id',
            'CASCADE',
            'CASCADE'
        );

        $this->addForeignKey(
            'fk-student_answers-answer_id',
            '{{%student_answers}}',
            'answer_id',
            '{{%links}}',
            'id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        // Reverse 'student_answers' table creation
        $this->dropTable('{{%student_answers}}');

        // Reverse 'correct_answer' column addition
        $this->dropColumn('{{%exam_questions}}', 'correct_answer');

        // Reverse 'question_type' column addition
        $this->dropColumn('{{%exam_questions}}', 'question_type');

        // Reverse removal of 'type' column from 'exams' table
        $this->addColumn('{{%exams}}', 'type', $this->string(50)->notNull());
    }
}
