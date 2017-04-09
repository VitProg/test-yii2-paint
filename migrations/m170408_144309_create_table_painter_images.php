<?php

use yii\db\Migration;

class m170408_144309_create_table_painter_images extends Migration
{
    public function up()
    {
        $this->createTable('{{painter_images}}', [
            'id' => $this->primaryKey()->unsigned()->notNull(),
            'title' => $this->string(64)->notNull(),
            'file' => $this->string(64)->notNull(),
            'pass' => $this->string(64)->notNull(),
            'updated_at' => $this->timestamp(),
            'created_at' => $this->timestamp()->defaultValue(null),
            'ip' => $this->string(15)->notNull(),
        ]);

    }

    public function down()
    {
        echo "m170408_144309_create_table_painter_images cannot be reverted.\n";

        $this->dropTable('{{painter_images}}');

        return false;
    }

    /*
    // Use safeUp/safeDown to run migration code within a transaction
    public function safeUp()
    {
    }

    public function safeDown()
    {
    }
    */
}
