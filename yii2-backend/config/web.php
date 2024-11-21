<?php

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$config = [
    'id' => 'basic',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm'   => '@vendor/npm-asset',
    ],
    'components' => [
        'db' => $db,
        'user' => [
            'identityClass' => 'yii2-backend\models\Users',
            'enableSession' => false, // Disable session for stateless API
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => true,
            'rules' => [
                // 'GET api/users' => 'api/get-users',
                // 'GET api/user/<id:\d+>' => 'api/get-user',
                'POST api/register' => 'users/register',
                'POST api/login' => 'users/login',
            ],
        ],
        'request' => [
            'enableCookieValidation' => false,
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ]
        ],
    ],

    'as cors' => [
        'class' => \yii\filters\Cors::class,
        'cors' => [
            'Origin' => ['http://localhost:3000'], // Allow only from this origin
            'Access-Control-Request-Method' => ['POST', 'OPTIONS'],
            'Access-Control-Allow-Credentials' => true, 
            'Access-Control-Max-Age' => 3600,
            'Access-Control-Allow-Headers' => ['Content-Type', 'Authorization'],
        ],
    ],
    

    'params' => $params,
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
        // Uncomment and configure allowed IPs if needed
        // 'allowedIPs' => ['127.0.0.1', '::1'],
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
        // Uncomment and configure allowed IPs if needed
        // 'allowedIPs' => ['127.0.0.1', '::1'],
    ];
}

return $config;
