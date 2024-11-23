<?php
namespace app\controllers;

use Yii;
use yii\rest\Controller;
use app\models\Users;
use yii\web\Response;

class UsersController extends Controller
{
    public $enableCsrfValidation = false;

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
            return ['status' => 'success', 'message' => 'User registered successfully.'];
        }

        return ['status' => 'error', 'errors' => $user->errors];
    }


    public function actionLogin()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $data = Yii::$app->request->post();

        $user = Users::findByEmail($data['email'] ?? '');
        if ($user && $user->validatePassword($data['password'] ?? '')) {
            return ['status' => 'success', 'message' => 'Login successful.'];
        }

        return ['status' => 'error', 'message' => 'Invalid email or password.'];
    }
}
