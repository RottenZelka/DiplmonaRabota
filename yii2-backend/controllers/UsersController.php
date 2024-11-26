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
            // Store user information in the session
            $session = Yii::$app->session;
            $session->open();
            $session->set('user_id', $user->id);
            $session->set('user_type', $user->user_type);

            return [
                'status' => 'success',
                'message' => 'Login successful.',
                'user_id' => $session->get('user_id'),
                'user_type' => $session->get('user_type'),
            ];
        }

        return ['status' => 'error', 'message' => 'Invalid email or password.'];
    }

    public function actionLogout()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $session = Yii::$app->session;
        if ($session->isActive) {
            $session->destroy();
        }

        return ['status' => 'success', 'message' => 'Logout successful.'];
    }

    public function actionCheckSession()
    {
        $sessionId = Yii::$app->session->getId();

        Yii::$app->response->format = Response::FORMAT_JSON;

        $session = Yii::$app->session;
        if ($session->isActive && $session->has('user_id')) {
            $user = Users::findOne($session->get('user_id'));
            return [
                'status' => 'success',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'user_type' => $user->user_type,
                ],
            ];
        }

        return ['status' => 'error', 'message' => $session];
    }

}
