<?php
namespace app\controllers;

use Yii;
use yii\rest\Controller;
use app\models\Users;
use yii\web\Response;

class UsersController extends Controller
{
    public $enableCsrfValidation = false;

    // Handle preflight OPTIONS requests to avoid CORS issues
    public function beforeAction($action)
    {
        // Handle preflight OPTIONS request
        if (Yii::$app->request->isOptions) {
            Yii::$app->response->getHeaders()->set('Access-Control-Allow-Origin', 'http://localhost:3000');
            Yii::$app->response->getHeaders()->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            Yii::$app->response->getHeaders()->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            Yii::$app->response->statusCode = 200;  // Respond with 200 OK for OPTIONS request
            return false;  // Prevent the action from being executed
        }

        return parent::beforeAction($action);  // Continue with normal action handling
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
