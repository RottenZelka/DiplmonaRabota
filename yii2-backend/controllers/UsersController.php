<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use app\models\Users;
use yii\web\Response;
use app\controllers\AuthHelper;

class UsersController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionRegister()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $data = Yii::$app->request->post();

        $user = new Users();
        $user->email = $data['email'] ?? null;
        $user->user_type = $data['user_type'] ?? null;
        $user->setPassword($data['password'] ?? '');

        if (!in_array($user->user_type, ['school', 'student'])) {
            return ['status' => 'error', 'message' => 'Invalid user type.'];
        }

        if ($user->save()) {
            $token = AuthHelper::generateJwt($user);

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
                    'token' => $token,
                ];
            }
        }

        return ['status' => 'error', 'errors' => $user->errors];
    }

    public function actionSignin() {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $data = Yii::$app->request->post();

        $user = Users::findByEmail($data['email'] ?? '');
        if ($user && $user->validatePassword($data['password'] ?? '')) {
            $token = AuthHelper::generateJwt($user);
            return ['status' => 'success', 'message' => 'Login successful.', 'token' => $token];
        }

        return ['status' => 'error', 'message' => 'Invalid email or password.'];
    }

    public function actionGetUserType($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // Find the user by ID
        $user = Users::findOne($id);

        if (!$user) {
            return ['status' => 'error', 'message' => 'User not found.'];
        }

        // Return the user type
        return [
            'status' => 'success',
            'data' => [
                'user_id' => $user->id,
                'user_type' => $user->user_type, // 'school' or 'student'
            ],
        ];
    }

}
