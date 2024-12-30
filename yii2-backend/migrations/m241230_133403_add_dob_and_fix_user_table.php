<?php

use yii\db\Migration;

/**
 * Class m241230_133403_add_dob_and_fix_user_table
 */
class m241230_133403_add_dob_and_fix_user_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {   
        $this->dropColumn('{{%student}}', 'age');
        $this->addColumn('{{%student}}', 'dob', $this->date()->notNull()->defaultValue("2000-01-01"));
        $this->dropColumn('{{%users}}', 'created_at');
        $this->dropColumn('{{%users}}', 'updated_at');
        $this->addColumn('{{%users}}', 'created_at', $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'));
        $this->addColumn('{{%users}}', 'updated_at', $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m241230_133403_add_dob_and_fix_user_table cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m241230_133403_add_dob_and_fix_user_table cannot be reverted.\n";

        return false;
    }
    */
}
