<?php

namespace app\controllers;

use Yii;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use app\models\Users;
use yii\web\Response;

class AuthHelper
{
    private static $jwtSecret = 'woeugyfvc3485gf07grwe087g307r8gf207grf70327fg-refg23095'; // Replace with secure configuration
    private static $refreshTokenSecret = 'fwuegyofiype9rhg-f9hwper8fhwp[e9rufb9uwxnq09[wf[weny'; // Different secret for refresh tokens

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

    public static function generateRefreshToken($user)
    {
        $payload = [
            'iss' => 'http://localhost', // Issuer
            'aud' => 'http://localhost', // Audience
            'iat' => time(), // Issued at
            'exp' => time() + (7 * 24 * 60 * 60), // Expiry time (7 days)
            'data' => [
                'user_id' => $user->id,
            ],
        ];

        return JWT::encode($payload, self::$refreshTokenSecret, 'HS256');
    }

    public static function validateJwt($token)
    {
        try {
            return JWT::decode($token, new Key(self::$jwtSecret, 'HS256'));
        } catch (\Exception $e) {
            return null; // Token invalid
        }
    }

    public static function validateRefreshToken($token)
    {
        try {
            return JWT::decode($token, new Key(self::$refreshTokenSecret, 'HS256'));
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

    public static function refreshAccessToken($refreshToken)
    {
        $decoded = self::validateRefreshToken($refreshToken);
        if (!$decoded) {
            return null; // Invalid refresh token
        }

        // Fetch user from database using $decoded->data->user_id
        $user = Users::findOne($decoded->data->user_id);
        if (!$user) {
            return null; // User not found
        }

        // Generate a new access token
        return self::generateJwt($user);
    }

     /**
     * Handle refresh token requests.
     *
     * @return array
     */
    public static function handleRefreshToken()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $refreshToken = Yii::$app->request->post('refresh_token');
        if (!$refreshToken) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Refresh token is required.'];
        }

        $newAccessToken = self::refreshAccessToken($refreshToken);
        if (!$newAccessToken) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Invalid or expired refresh token.'];
        }

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'access_token' => $newAccessToken,
        ];
    }
}