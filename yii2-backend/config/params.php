<?php

return [
    'adminEmail' => getenv('ADMIN_EMAIL') ?: 'admin@example.com',
    'supportEmail' => getenv('SUPPORT_EMAIL') ?: 'support@example.com',
    'jwtSecret' => getenv('JWT_SECRET') ?: "dsauvbfbcuoiweryfodycabgsodyifbuywervbsdfoucybrpwufbewr",
    'refreshTokenSecret' => getenv('REFRESH_TOKEN_SECRET') ?: 'sciaudgbfoicywrsbdifpcbnewpruifhoicywrsdfioyvbcowiyf',
    'bootstrap' => [
        'app\controllers\AuthHelper',
    ],

];
