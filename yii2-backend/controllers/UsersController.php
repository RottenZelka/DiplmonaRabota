<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Users;
use app\controllers\AuthHelper;
use app\models\Links;
use app\models\School;
use app\models\Student;

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
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Invalid user type.'];
        }

        if ($user->save()) {
            $token = AuthHelper::generateJwt($user);

            if ($user->user_type === 'school') {
                Yii::$app->response->statusCode = 200;
                return [
                    'status' => 'success',
                    'message' => 'User registered as school. Please complete your school registration.',
                    'token' => $token,
                ];
            } else {
                Yii::$app->response->statusCode = 200;
                return [
                    'status' => 'success',
                    'message' => 'User registered as student. Please complete your student registration.',
                    'token' => $token,
                ];
            }
        }

        Yii::$app->response->statusCode = 500;
        return ['status' => 'error', 'errors' => $user->errors];
    }

    public function actionSignin()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $data = Yii::$app->request->post();

        $user = Users::findByEmail($data['email'] ?? '');
        if ($user && $user->validatePassword($data['password'] ?? '')) {
            $token = AuthHelper::generateJwt($user);
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'message' => 'Login successful.', 'token' => $token];
        }

        Yii::$app->response->statusCode = 401;
        return ['status' => 'error', 'message' => 'Invalid email or password.'];
    }

    public function actionGetUserType($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $user = Users::findOne($id);

        if (!$user) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'User not found.'];
        }

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'data' => [
                'user_id' => $user->id,
                'user_type' => $user->user_type,
            ],
        ];
    }

    public function actionGetProfileImage($userId) {
        // Get the user's role
        $user = Users::findOne($userId);
        
        if (!$user) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'User not found.'];
        }
        
        $profilePhotoUrl = null;
    
        switch ($user->user_type) {
            case 'school':
                $school = School::find()->where(['user_id' => $userId])->one();
                if ($school) {
                    // Get actual URL from your file storage system
                    $profilePhotoUrl = $this->getFileUrl($school->profile_photo_id); 
                }
                break;
                
            case 'student':
                $student = Student::find()->where(['user_id' => $userId])->one();
                if ($student) {
                    // Get actual URL from your file storage system
                    $profilePhotoUrl = $this->getFileUrl($student->profile_photo_id);
                }
                break;
        }
    
        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'user' => $user,
            'profile_photo_id' => $profilePhotoUrl,
        ];
    }
    
    private function getFileUrl($fileId) {
        if (!$fileId) return null;
        
        // Implement your actual file URL retrieval logic here
        $fileModel = Links::findOne($fileId);
        return $fileModel ? $fileModel->url : null;
    }

    public function actionDelete()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $user = Users::findOne($authenticatedUser->user_id);
        if (!$user) {
            Yii::$app->response->statusCode = 404; 
            return ['status' => 'error', 'message' => 'user not found.'];
        }

        if ($user->delete()) {
            Yii::$app->response->statusCode = 200; 
            return ['status' => 'success', 'message' => 'user deleted successfully.'];
        }

        Yii::$app->response->statusCode = 400; 
        return ['status' => 'error', 'message' => 'Failed to delete user.'];
    }
}