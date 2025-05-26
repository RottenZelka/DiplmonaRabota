<?php

return [
    'adminEmail' => getenv('ADMIN_EMAIL') ?: 'admin@example.com',
    'supportEmail' => getenv('SUPPORT_EMAIL') ?: 'support@example.com',
    //'user.passwordResetTokenExpire' => 3600,
    'jwtSecret' => getenv('JWT_SECRET'),
    'refreshTokenSecret' => getenv('REFRESH_TOKEN_SECRET'),
    'bootstrap' => [
        'app\controllers\AuthHelper',
    ],

];
