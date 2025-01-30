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
                
                // Exam Questions
                'POST api/exam-questions/create' => 'exam-questions/create',
                'PUT,PATCH api/exam-questions/update/<id:\d+>' => 'exam-questions/update',
                'POST api/exam-questions/check-question/<examId:\d+>/<studentId:\d+>/<questionId:\d+>' => 'exam-questions/check-question',
                'DELETE api/exam-questions/delete/<id:\d+>' => 'exam-questions/delete',
                'GET api/exam-questions/get-exam-questions/<examId:\d+>' => 'exam-questions/get-exam-questions',
                'GET api/exam-questions/review-question/<examId:\d+>/<studentId:\d+>/<questionId:\d+>' => 'exam-questions/review-question',
                'GET api/exam-questions/get-exam-questions/<examId:\d+>/<questionId:\d+>' => 'exam-questions/get-exam-questions',
                'OPTIONS api/exam-questions/create' => 'exam-questions/create',
                'OPTIONS api/exam-questions/update/<id:\d+>' => 'exam-questions/update',
                'OPTIONS api/exam-questions/check-question/<examId:\d+>/<studentId:\d+>/<questionId:\d+>' => 'exam-questions/check-question',
                'OPTIONS api/exam-questions/delete/<id:\d+>' => 'exam-questions/delete',
                'OPTIONS api/exam-questions/get-exam-questions/<examId:\d+>' => 'exam-questions/get-exam-questions',
                'OPTIONS api/exam-questions/review-question/<examId:\d+>/<studentId:\d+>/<questionId:\d+>' => 'exam-questions/review-question',
                'OPTIONS api/exam-questions/get-exam-questions/<examId:\d+>/<questionId:\d+>' => 'exam-questions/get-exam-questions',
                'GET api/question-types' => 'exam-questions/question-types',
                'OPTIONS api/question-types' => 'exam-questions/question-types',

                // Exam Results
                'GET api/exam-results/view-results/<examId:\d+>' => 'exam-results/view-results',
                'POST api/exam-results/check-exam/<examId:\d+>/<studentId:\d+>' => 'exam-results/check-exam',
                'OPTIONS api/exam-results/view-results/<examId:\d+>' => 'exam-results/view-results',
                'OPTIONS api/exam-results/check-exam/<examId:\d+>/<studentId:\d+>' => 'exam-results/check-exam',

                // Exams
                'POST api/exams/create' => 'exams/create',
                'PUT,PATCH api/exams/update/<id:\d+>' => 'exams/update',
                'DELETE api/exams/delete/<id:\d+>' => 'exams/delete',
                'GET api/exams/list-exams/<schoolId:\d+>' => 'exams/list-exams',
                'GET api/exams/<id:\d+>' => 'exams/view',
                'OPTIONS api/exams/<id:\d+>' => 'exams/view',
                'OPTIONS api/exams/create' => 'exams/create',
                'OPTIONS api/exams/update/<id:\d+>' => 'exams/update',
                'OPTIONS api/exams/delete/<id:\d+>' => 'exams/delete',
                'OPTIONS api/exams/list-exams/<schoolId:\d+>' => 'exams/list-exams',

                // Student Answers
                'POST api/student-answers/submit' => 'student-answers/submit',
                'GET api/student-answers/view-results' => 'student-answers/view-results',
                'GET api/student-answers/view-exams/<schoolId:\d+>' => 'student-answers/view-exams',
                'OPTIONS api/student-answers/submit' => 'student-answers/submit',
                'OPTIONS api/student-answers/view-results' => 'student-answers/view-results',
                'OPTIONS api/student-answers/view-exams/<schoolId:\d+>' => 'student-answers/view-exams',
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
            'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], 
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
