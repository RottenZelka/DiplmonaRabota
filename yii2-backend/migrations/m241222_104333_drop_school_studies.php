<?php

use yii\db\Migration;

/**
 * Class m241222_104333_drop_school_studies
 */
class m241222_104333_drop_school_studies extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // Drop `school_studies` table
        $this->dropForeignKey('fk-school_studies-study_id', '{{%school_studies}}');
        $this->dropForeignKey('fk-school_studies-school_id', '{{%school_studies}}');
        $this->dropTable('{{%school_studies}}');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
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
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m241222_104333_drop_school_studies cannot be reverted.\n";

        return false;
    }
    */
}
