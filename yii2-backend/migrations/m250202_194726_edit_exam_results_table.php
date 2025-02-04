<?php

use yii\db\Migration;

/**
 * Class m250202_194726_edit_exam_results_table
 */
class m250202_194726_edit_exam_results_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->dropColumn('{{%exam_results}}', 'total_questions');
        $this->dropColumn('{{%exam_results}}', 'correct_answers');
        $this->dropColumn('{{%exam_results}}', 'show_answers');

        $this->addColumn('{{%exam_results}}', 'max_points', $this->integer()->notNull()->defaultValue(0));
        $this->addColumn(
            '{{%exam_results}}',
            'status',
            "ENUM('pending', 'checked', 'waiting') NOT NULL DEFAULT 'waiting'"
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m250202_194726_edit_exam_results_table cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m250202_194726_edit_exam_results_table cannot be reverted.\n";

        return false;
    }
    */
}
