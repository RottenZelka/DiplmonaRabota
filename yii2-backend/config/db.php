<?php

return [
    'class' => 'yii\db\Connection',
    'dsn' => getenv('DB_DSN') ?: 'mysql:host=127.0.0.1;port=3307;dbname=yii2db',
    'username' => getenv('DB_USERNAME') ?: 'yii2user',
    'password' => getenv('DB_PASSWORD') ?: 'yii2password',
    'charset' => 'utf8',
];


