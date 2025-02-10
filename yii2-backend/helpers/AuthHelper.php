<?php
namespace app\helpers;

use Yii;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use app\models\RefreshTokens;

class AuthHelper
{
    private static $jwtSecret = 'dlmwldomowqsmlasdlmalmdlmwelwqmeasdomdome'; // Use a secure method to store this

    public static function generateJwt($user)
    {
        $payload = [
            'iss' => 'http://localhost', // Issuer
            'aud' => 'http://localhost', // Audience
            'iat' => time(), // Issued at
            'exp' => time() + (15 * 60), // Expiry time
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

    public static function generateRefreshToken($user)
    {
        $token = bin2hex(random_bytes(32));
        $expiresAt = time() + (60 * 60 * 24 * 7); // 7 days

        $refreshToken = new RefreshTokens();
        $refreshToken->user_id = $user->id;
        $refreshToken->token = $token;
        $refreshToken->expires_at = $expiresAt;
        $refreshToken->created_at = time();
        $refreshToken->updated_at = time();

        if (!$refreshToken->save()) {
            Yii::error('Failed to save refresh token: ' . print_r($refreshToken->errors, true));
            return null;
        }

        return $token;
    }

    public static function validateRefreshToken($token)
    {
        $refreshToken = RefreshTokens::findOne(['token' => $token]);

        if ($refreshToken && $refreshToken->expires_at > time()) {
            return $refreshToken;
        }

        return null;
    }

    public static function issueNewAccessToken($refreshToken)
    {
        $user = $refreshToken->user;
        $accessToken = self::generateJwt($user);

        $refreshToken->updated_at = time();
        $refreshToken->save();

        return $accessToken;
    }
}
