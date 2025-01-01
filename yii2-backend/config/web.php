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
        // 'session' => [
        //     'class' => 'yii\web\DbSession',
        //     'sessionTable' => 'session', // Default table name for sessions
        //     'cookieParams' => [
        //         'httpOnly' => true,
        //         'secure' => false,
        //         'sameSite' => 'None', // Or 'None' if working cross-site (with SSL)
        //         'path' => '/',
        //     ],
        //     'useCookies' => true,
        // ],
        'user' => [
            'identityClass' => 'yii2-backend\models\Users',
            'enableSession' => true,
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => true,
            'rules' => [
                // school api
                'GET api/schools' => 'school/index', // List all schools
                'GET api/school/<id:\d+>' => 'school/view', // Get school by ID
                'GET api/schools/filter-by-level/<level:\w+>' => 'school/filter-by-level', // Filter schools by level
                'GET api/schools/filter-by-study/<study:\w+>' => 'school/filter-by-study', // Filter schools by area of study
                'OPTIONS api/schools' => 'school/index', 
                'OPTIONS api/school/<id:\d+>' => 'school/view',
                'OPTIONS api/schools/filter-by-level/<level:\w+>' => 'school/filter-by-level',
                'OPTIONS api/schools/filter-by-study/<study:\w+>' => 'school/filter-by-study',
                'POST api/school' => 'school/create', // Create a school
                'OPTIONS api/school' => 'school/create',
                'PATCH api/school/<id:\d+>' => 'school/update', // Update a school (partial)
                'OPTIONS api/school/<id:\d+>' => 'school/update',
                'DELETE api/school/<id:\d+>' => 'school/delete', // Delete a school

                // student api
                'GET api/students' => 'student/index', // List all students
                'GET api/student/<id:\d+>' => 'student/view', // Get student by ID
                'OPTIONS api/schools' => 'school/index', 
                'OPTIONS api/school/<id:\d+>' => 'school/view',
                'POST api/student' => 'student/create', // Create a student
                'OPTIONS api/student' => 'student/create',
                'PATCH api/student/<id:\d+>' => 'student/update', // Update a school (partial)
                'OPTIONS api/student/<id:\d+>' => 'student/update',
                'DELETE api/student/<id:\d+>' => 'student/delete', // Delete a student
                'OPTIONS api/student/<id:\d+>' => 'student/delete',

                //school levels api
                'GET api/levels' => 'school-levels/get-levels',
                'GET api/levels/<id:\d+>' => 'school-levels/get-level',
                'OPTIONS api/levels' => 'school-levels/get-levels',
                'OPTIONS api/levels/<id:\d+>' => 'school-levels/get-level',

                //school studies api
                'GET api/studies' => 'studies/get-studies',
                'GET api/studies/<id:\d+>' => 'studies/get-study',
                'OPTIONS api/studies' => 'studies/get-studies',
                'OPTIONS api/studies/<id:\d+>' => 'studies/get-study',

                //images api
                'POST api/images/upload-image' => 'images/upload-image',
                'OPTIONS api/images/upload-image' => 'images/upload-image',
            
                // UsersController routes
                'OPTIONS api/register' => 'users/register',
                'POST api/register' => 'users/register',
                'OPTIONS api/signin' => 'users/signin',
                'POST api/signin' => 'users/signin',
                'OPTIONS api/logout' => 'users/logout',
                'POST api/logout' => 'users/logout',
                'GET api/users/type/<id>' => 'users/get-user-type',
                'OPTIONS api/users/type/<id>' => 'users/get-user-type',
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
