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
    private $jwtSecret = 'your-secret-key-here'; // Replace with a strong secret key

    public $enableCsrfValidation = false;

    private function generateJwt($user) {
        $payload = [
            'iss' => 'http://localhost', // Issuer
            'aud' => 'http://localhost', // Audience
            'iat' => time(), // Issued at
            'exp' => time() + (60 * 60), // Expiry time (1 hour)
            'data' => [
                'user_id' => $user->id,
                'username' => $user->username,
                'user_type' => $user->user_type,
            ]
        ];

        return JWT::encode($payload, $this->jwtSecret, 'HS256');
    }

    private function validateJwt($token) {
        try {
            return JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
        } catch (\Exception $e) {
            return null; // Token invalid
        }
    }

    public function actionRegister()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $data = Yii::$app->request->post();

        $user = new Users();
        $user->username = $data['username'] ?? null;
        $user->email = $data['email'] ?? null;
        $user->user_type = $data['user_type'] ?? null;
        $user->setPassword($data['password'] ?? '');
        $user->created_at = time();
        $user->updated_at = time();

        if (!in_array($user->user_type, ['school', 'student'])) {
            return ['status' => 'error', 'message' => 'Invalid user type.'];
        }

        if ($user->save()) {
            $token = $this->generateJwt($user);

            if ($user->user_type === 'school') {
                return [
                    'status' => 'success',
                    'message' => 'User registered as school. Please complete your school registration.',
                    'redirect' => Yii::$app->urlManager->createUrl(['api/school/register']),
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


    public function actionCheckSession()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // Retrieve Authorization header
        $authHeader = Yii::$app->request->headers->get('Authorization');

        // Debugging: Check if the Authorization header is present
        if (!$authHeader) {
            return ['status' => 'error', 'message' => 'Token not provided.'];
        }

        // Extract the token from the header
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return ['status' => 'error', 'message' => 'Invalid Authorization header format.'];
        }

        $token = $matches[1]; // The actual JWT token

        // Validate the token
        $decoded = $this->validateJwt($token);
        if ($decoded) {
            $user = Users::findOne($decoded->data->user_id);
            if ($user) {
                return [
                    'status' => 'success',
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'user_type' => $user->user_type,
                    ],
                ];
            }
        }

        return ['status' => 'error', 'message' => 'Invalid or expired token.'];
    }


    public function actionLogout() {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // JWT-based logout is typically handled on the client side by deleting the token
        return ['status' => 'success', 'message' => 'Logout successful.'];
    }

    public function actionSchools() {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $schools = Users::find()->where(['user_type' => 'school'])->all();
        if ($schools) {
            $schoolList = array_map(function ($school) {
                return [
                    'id' => $school->id,
                    'username' => $school->username,
                    'email' => $school->email,
                ];
            }, $schools);

            return ['status' => 'success', 'schools' => $schoolList];
        }

        return ['status' => 'error', 'message' => 'No schools found.'];
    }

    public function actionSchool($id) {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $school = Users::find()->where(['user_type' => 'school', 'id' => $id])->one();
        if ($school) {
            return [
                'status' => 'success',
                'school' => [
                    'id' => $school->id,
                    'username' => $school->username,
                    'email' => $school->email,
                    'created_at' => date('Y-m-d H:i:s', $school->created_at),
                ],
            ];
        }

        return ['status' => 'error', 'message' => 'School not found.'];
    }
}
