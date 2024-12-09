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
        'session' => [
            'class' => 'yii\web\DbSession',
            'sessionTable' => 'session', // Default table name for sessions
            'cookieParams' => [
                'httpOnly' => true,
                'secure' => false,
                'sameSite' => 'None', // Or 'None' if working cross-site (with SSL)
                'path' => '/',
            ],
            'useCookies' => true,
        ],
        'user' => [
            'identityClass' => 'yii2-backend\models\Users',
            'enableSession' => true,
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => true,
            'rules' => [
                'GET api/school/<id:\d+>' => 'users/school',
                'GET api/schools' => 'users/schools',
                'GET api/check-session' => 'users/check-session',
                'OPTIONS api/logout' => 'users/logout',
                'POST api/logout' => 'users/logout',
                'OPTIONS api/register' => 'users/register',
                'POST api/register' => 'users/register',
                'OPTIONS api/login' => 'users/login',
                'POST api/login' => 'users/login',
                
            ],
        ],
        'request' => [
            'cookieValidationKey' => 'your-secret-key-here',
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
            'Access-Control-Allow-Headers' => ['Content-Type', 'Authorization'],
            'Access-Control-Allow-Credentials' => true,
            'Access-Control-Max-Age' => 3600,
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
