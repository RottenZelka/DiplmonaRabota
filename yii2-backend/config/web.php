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
                'OPTIONS api/schools' => 'school/index', 
                'OPTIONS api/school/<id:\d+>' => 'school/view',
                'POST api/school' => 'school/create', // Create a school
                'OPTIONS api/school' => 'school/create',
                'PATCH api/school/<id:\d+>' => 'school/update', // Update a school (partial)
                'OPTIONS api/school/<id:\d+>' => 'school/update',
                'DELETE api/school/<id:\d+>' => 'school/delete', // Delete a school
                'OPTIONS api/schools' => 'school/index', 
                'OPTIONS api/school/<id:\d+>' => 'school/view',

                // student api
                'GET api/students' => 'student/index', // List all students
                'GET api/student/<id:\d+>' => 'student/view', // Get student by ID
                'POST api/student' => 'student/create', // Create a student
                'OPTIONS api/student' => 'student/create',
                'OPTIONS api/students' => 'student/index',
                'OPTIONS api/student' => 'student/view',
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

                //links api
                'POST api/links/upload' => 'links/upload',
                'OPTIONS api/links/upload' => 'links/upload',

                //application
                'POST api/application/<id:\d+>' => 'applications/apply',
                'OPTIONS api/application/<id:\d+>' => 'applications/apply',
                'GET api/applications' => 'applications/all',
                'OPTIONS api/applications' => 'applications/all',
                'GET api/application/<id:\d+>' => 'applications/view',
                'OPTIONS api/application/<id:\d+>' => 'applications/view',  
                'POST api/application/handle/<id:\d+>' => 'applications/handle',
                'OPTIONS api/application/handle/<id:\d+>' => 'applications/handle',
                'GET api/is-applied/<id:\d+>' => 'applications/is-applied',
                'OPTIONS api/is-applied/<id:\d+>' => 'applications/is-applied',
            
                // UsersController routes
                'OPTIONS api/register' => 'users/register',
                'POST api/register' => 'users/register',
                'OPTIONS api/signin' => 'users/signin',
                'POST api/signin' => 'users/signin',
                'OPTIONS api/logout' => 'users/logout',
                'POST api/logout' => 'users/logout',
                'GET api/users/type/<id>' => 'users/get-user-type',
                'OPTIONS api/users/type/<id>' => 'users/get-user-type',
                
                // ExamController routes
                'GET api/exams/<school_id:\d+>' => 'exams/index',
                'POST api/exams' => 'exams/create',
                'PUT api/exams/<id:\d+>' => 'exams/update',
                'DELETE api/exams/<id:\d+>' => 'exams/delete',
                'OPTIONS api/exams/<school_id:\d+>' => 'exams/index',
                'OPTIONS api/exams' => 'exams/create',
                'OPTIONS api/exams/<id:\d+>' => 'exams/update',
                'OPTIONS api/exams/<id:\d+>' => 'exams/delete',
    
                // StudentExamController routes
                'GET api/student-exams/<student_id:\d+>' => 'student-exams/student-exams',
                'POST api/student-exams/assign' => 'student-exams/assign-to-student',
                'OPTIONS api/student-exams/<student_id:\d+>' => 'student-exams/student-exams',
                'OPTIONS api/student-exams/assign' => 'student-exams/assign-to-student',
    
                // ExamQuestionController routes
                'GET api/exam-questions/<exam_id:\d+>' => 'exam-questions/exam-questions',
                'POST api/exam-questions/add' => 'exam-questions/add-question',
                'OPTIONS api/exam-questions/<exam_id:\d+>' => 'exam-questions/exam-questions',
                'OPTIONS api/exam-questions/add' => 'exam-questions/add-question',

                // StudentAnswersController routes
                'POST api/student-answers/submit' => 'student-answers/submit',
                'GET api/student-answers/view-exam-answers/<exam_id:\d+>' => 'student-answers/view-exam-answers',
                'DELETE api/student-answers/delete' => 'student-answers/delete',
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
            'Origin' => ['http://localhost:3000'], 
            'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
            'Access-Control-Allow-Headers' => ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'X_PHP_Response_Code'],
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
