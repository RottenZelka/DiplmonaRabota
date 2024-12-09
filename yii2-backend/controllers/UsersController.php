<?php
namespace app\controllers;

use Yii;
use yii\rest\Controller;
use app\models\Users;
use yii\web\Response;

class UsersController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionRegister() {
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
            $session = Yii::$app->session;
            $session->open();
            $session->regenerateID();
            $session->set('user_id', $user->id);
            $session->set('user_type', $user->user_type);

            return ['status' => 'success', 'message' => 'User registered successfully.', 'user' => $session->getId()];
        }

        return ['status' => 'error', 'errors' => $user->errors];
    }

    public function actionLogin() {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $data = Yii::$app->request->post();

        $user = Users::findByEmail($data['email'] ?? '');
        if ($user && $user->validatePassword($data['password'] ?? '')) {
            $session = Yii::$app->session;
            if (!$session->isActive) {
                $session->open(); // Open session if not already active
            }

            // Store user data in the session
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

    public function actionCheckSession() {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $session = Yii::$app->session;
        if ($session->isActive && $session->has('user_id')) {
            $user = Users::findOne($session->get('user_id'));
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

        return ['status' => 'error', 'message' => 'Session not active or user not found.'];
    }

    public function actionLogout() {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $session = Yii::$app->session;
        if ($session->isActive) {
            $session->close(); // Destroy the session completely
        }

        return ['status' => 'success', 'message' => 'Logout successful.'];
    }

    public function actionSchools() {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $schools = Users::find()
            ->where(['user_type' => 'school'])
            ->all();

        if ($schools) {
            $schoolList = array_map(function ($school) {
                return [
                    'id' => $school->id,
                    'username' => $school->username,
                    'email' => $school->email,
                ];
            }, $schools);

            return [
                'status' => 'success',
                'schools' => $schoolList,
            ];
        }

        return ['status' => 'error', 'message' => 'No schools found.'];
    }

    public function actionSchool($id) {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $school = Users::find()
            ->where(['user_type' => 'school', 'id' => $id])
            ->one();

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
