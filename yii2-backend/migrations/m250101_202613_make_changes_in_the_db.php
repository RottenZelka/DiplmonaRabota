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
        $this->addForeignKey(
            'fk-school-user_id',
            '{{%school}}',
            'user_id',
            '{{%users}}',
            'id', // updated reference column
            'CASCADE'
        );
        // Add new enum column to Links table
        $this->addColumn('{{%links}}', 'type', "ENUM('Profile Image', 'Post Image', 'File', 'Album') NOT NULL DEFAULT 'File'");

        // Add new enum column to Period table
        $this->addColumn('{{%period}}', 'type', "ENUM('vacation', 'student studied from to', 'school year') NOT NULL DEFAULT 'school year'");


        // Update foreign key for Posts table to reference Links.id
        $this->dropForeignKey('fk-posts-user_id', '{{%posts}}'); // Remove old foreign key
        $this->addForeignKey('fk-posts-links_id', '{{%posts}}', 'user_id', '{{%links}}', 'id', 'CASCADE');

        // Update foreign key for Student and School profile_photo_id to reference Links.id
        $this->dropForeignKey('fk-student-profile_photo_id', '{{%student}}');
        $this->addForeignKey('fk-student-links_id', '{{%student}}', 'profile_photo_id', '{{%links}}', 'id', 'SET NULL');

        $this->dropForeignKey('fk-school-profile_photo_id', '{{%school}}');
        $this->addForeignKey('fk-school-links_id', '{{%school}}', 'profile_photo_id', '{{%links}}', 'id', 'SET NULL');

        // Update foreign key for School Album to reference Links.id
        $this->dropForeignKey('fk-school_album-image_id', '{{%school_album}}');
        $this->addForeignKey('fk-school_album-links_id', '{{%school_album}}', 'image_id', '{{%links}}', 'id', 'CASCADE');
        
        // Remove Images and Post Images tables
        $this->dropTable('{{%post_images}}');
        $this->dropTable('{{%images}}');
    }

    public function safeDown()
    {
        // Revert foreign key for School Album
        $this->dropForeignKey('fk-school_album-links_id', '{{%school_album}}');
        $this->addForeignKey('fk-school_album-image_id', '{{%school_album}}', 'image_id', '{{%images}}', 'id', 'CASCADE');

        // Revert foreign key for Student and School profile_photo_id
        $this->dropForeignKey('fk-student-links_id', '{{%student}}');
        $this->addForeignKey('fk-student-profile_photo_id', '{{%student}}', 'profile_photo_id', '{{%images}}', 'id', 'SET NULL');

        $this->dropForeignKey('fk-school-links_id', '{{%school}}');
        $this->addForeignKey('fk-school-profile_photo_id', '{{%school}}', 'profile_photo_id', '{{%images}}', 'id', 'SET NULL');

        // Revert foreign key for Posts table
        $this->dropForeignKey('fk-posts-links_id', '{{%posts}}');
        $this->addForeignKey('fk-posts-user_id', '{{%posts}}', 'user_id', '{{%users}}', 'id', 'CASCADE');

        // Restore Images and Post Images tables
        $this->createTable('{{%images}}', [
            'id' => $this->primaryKey(),
            'url' => $this->string()->notNull()
        ]);

        $this->createTable('{{%post_images}}', [
            'id' => $this->primaryKey(),
            'post_id' => $this->integer()->notNull(),
            'image_id' => $this->integer()->notNull()
        ]);

        // Remove added enum columns
        $this->dropColumn('{{%links}}', 'type');
        $this->dropColumn('{{%period}}', 'type');
    }
}
