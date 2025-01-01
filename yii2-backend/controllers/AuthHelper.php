<?php
namespace app\controllers;

use Yii;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthHelper
{
    private static $jwtSecret = 'your-secret-key-here'; // Replace with secure configuration
    
    public static function generateJwt($user)
    {
        $payload = [
            'iss' => 'http://localhost', // Issuer
            'aud' => 'http://localhost', // Audience
            'iat' => time(), // Issued at
            'exp' => time() + (60 * 60), // Expiry time (1 hour)
            'data' => [
                'user_id' => $user->id,
                'email' => $user->email,
                'user_type' => $user->user_type,
            ],
        ];

        return JWT::encode($payload, self::$jwtSecret, 'HS256');
    }


    public static function validateJwt($token)
    {
        try {
            return JWT::decode($token, new Key(self::$jwtSecret, 'HS256'));
        } catch (\Exception $e) {
            return null; // Token invalid
        }
    }

    public static function getAuthenticatedUser()
    {
        $authHeader = Yii::$app->request->headers->get('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return null;
        }
        $token = $matches[1];
        $decoded = self::validateJwt($token);
        return $decoded ? $decoded->data : null;
    }
}
