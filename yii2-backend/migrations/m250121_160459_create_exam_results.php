<?php

use yii\db\Migration;

/**
 * Class m250121_160459_create_exam_results
 */
class m250121_160459_create_exam_results extends Migration
{
    public function safeUp()
    {
        $this->createTable('exam_results', [
            'id' => $this->primaryKey(),
            'exam_id' => $this->integer()->notNull(),
            'student_id' => $this->integer()->notNull(),
            'total_questions' => $this->integer()->notNull(),
            'correct_answers' => $this->integer()->notNull(),
            'score' => $this->decimal(5, 2)->notNull(),
            'checked_at' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
        ]);

        // Add foreign keys
        $this->addForeignKey('fk-exam_results-exam_id', '{{%exam_results}}', 'exam_id', '{{%exams}}', 'id', 'CASCADE');
        $this->addForeignKey('fk-exam_results-student_id', '{{%exam_results}}', 'student_id', '{{%students}}', 'user_id', 'CASCADE');

        $this->addColumn('{{%exam_questions}}', 'max_points', $this->integer()->notNull()->defaultValue(0));
        $this->addColumn('{{%exams}}', 'author_id', $this->integer()->notNull());

        $this->addForeignKey(
            'fk-exams-author_id',
            '{{%exams}}',
            'author_id',
            '{{%school}}',
            'user_id',
            'CASCADE',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk_exam_results_exam', 'exam_results');
        $this->dropForeignKey('fk_exam_results_student', 'exam_results');
        $this->dropTable('exam_results');
    }
}
