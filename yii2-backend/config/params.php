<?php

return [
    'adminEmail' => 'admin@example.com',
    'senderEmail' => 'noreply@example.com',
    'senderName' => 'Example.com mailer',
    'yiisoft/yii-swagger' => [
        'annotation-paths' => [
            'yii2-backend/controllers' // Directory where annotations are used
        ],
        'cacheTTL' => 60 // Enables caching and sets TTL, "null" value means infinite cache TTL.
    ],
];
