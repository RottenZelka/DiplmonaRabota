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
        $this->addForeignKey('fk-exam_results-student_id', '{{%exam_results}}', 'student_id', '{{%student}}', 'user_id', 'CASCADE');

        $this->addColumn('{{%exam_questions}}', 'max_points', $this->integer()->notNull()->defaultValue(0));

        $this->addColumn('{{%links}}', 'author_id', $this->integer()->null());
        
        // only for albums
        $this->addForeignKey(
            'fk-links-author_id',
            '{{%links}}',
            'author_id',
            '{{%school}}',
            'user_id',
            'CASCADE',
            'CASCADE'
        );

        $this->addColumn('{{%student_answers}}', 'commentary', $this->text()->null());
        $this->addColumn('{{%student_answers}}', 'points', $this->integer()->null());

        $this->addColumn('{{%exam_results}}', 'commentary', $this->text()->null());
        $this->addColumn('{{%exam_results}}', 'show_answers', $this->boolean()->null());
        
        $this->dropTable('{{%student_exams}}');
    }

    public function safeDown()
    {
        $this->dropForeignKey('fk_exam_results_exam', 'exam_results');
        $this->dropForeignKey('fk_exam_results_student', 'exam_results');
        $this->dropTable('exam_results');
    }
}
