<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use app\models\Users;
use yii\web\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class UsersController extends Controller
{
    private $jwtSecret = 'your-secret-key-here';

    public $enableCsrfValidation = false;

    private function generateJwt($user)
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

        return JWT::encode($payload, $this->jwtSecret, 'HS256');
    }

    private function validateJwt($token)
    {
        try {
            return JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
        } catch (\Exception $e) {
            return null;
        }
    }

    public function actionRegister()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $data = Yii::$app->request->post();

        $user = new Users();
        $user->email = $data['email'] ?? null;
        $user->user_type = $data['user_type'] ?? null;
        $user->setPassword($data['password'] ?? '');
        $user->created_at = date('Y-m-d H:i:s');
        $user->updated_at = date('Y-m-d H:i:s');

        if (!in_array($user->user_type, ['school', 'student'])) {
            return ['status' => 'error', 'message' => 'Invalid user type.'];
        }

        if ($user->save()) {
            $token = $this->generateJwt($user);

            if ($user->user_type === 'school') {
                return [
                    'status' => 'success',
                    'message' => 'User registered as school. Please complete your school registration.',
                    'token' => $token,
                ];
            } else {
                return [
                    'status' => 'success',
                    'message' => 'User registered as student. Please complete your student registration.',
                    'redirect' => Yii::$app->urlManager->createUrl(['api/student/register']),
                    'token' => $token,
                ];
            }
        }

        return ['status' => 'error', 'errors' => $user->errors];
    }

    public function actionLogout() {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // JWT-based logout is typically handled on the client side by deleting the token
        return ['status' => 'success', 'message' => 'Logout successful.'];
    }
}
