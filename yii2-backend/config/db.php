<?php

$jawsdb_url = 'mysql://qvf0m4o49xz821bb:fspnankuwjg142ym@w1kr9ijlozl9l79i.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/hp5uwy9l7y5jhy59';

$url = parse_url($jawsdb_url);

return [
    'class' => 'yii\db\Connection',
    'dsn' => sprintf(
        'mysql:host=%s;port=%d;dbname=%s',
        $url['host'],
        isset($url['port']) ? $url['port'] : 3306,
        ltrim($url['path'], '/')
    ),
    'username' => $url['user'],
    'password' => isset($url['pass']) ? $url['pass'] : '',
    'charset' => 'utf8',
];
