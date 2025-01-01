<?php

use yii\db\Migration;

/**
 * Class m250101_202613_make_changes_in_the_db
 */
class m250101_202613_make_changes_in_the_db extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        // remove Images table and add column in links which is enum with what is the type of the link =>( Image, Address, Files, PFPs) 
        // can remove profile_photo_id from student and school and add to user table
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m250101_202613_make_changes_in_the_db cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m250101_202613_make_changes_in_the_db cannot be reverted.\n";

        return false;
    }
    */
}
