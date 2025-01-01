<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Student;
use app\models\Users;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use app\controllers\AuthHelper;

class StudentController extends Controller
{
    use AssignStudiesTrait;

    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $students = Student::find()
            ->leftJoin('images', 'images.id = student.profile_photo_id')
            ->select(['student.*', 'images.url AS profile_photo_url'])
            ->asArray()
            ->all();

        return [
            'status' => 'success',
            'students' => $students,
        ];
    }

    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $student = Student::find()
            ->leftJoin('images', 'images.id = student.profile_photo_id')
            ->select(['student.*', 'images.url AS profile_photo_url'])
            ->where(['student.user_id' => $id])
            ->one();

        if ($student) {
            return [
                'status' => 'success',
                'student' => $student,
            ];
        }

        return ['status' => 'error', 'message' => 'Student not found.'];
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $data = Yii::$app->request->post();

        $student = new Student();
        $student->user_id = $authenticatedUser->user_id; // Automatically set user_id from token
        $student->name = $data['name'] ?? null;
        $student->dob = $data['dob'] ?? null;

        // Handle profile photo
        if (!empty($data['profile_photo_id'])) {
            $image = \app\models\Images::findOne($data['profile_photo_id']);
            if ($image) {
                $student->profile_photo_id = $image->id;
            } else {
                return ['status' => 'error', 'message' => 'Invalid profile photo ID.'];
            }
        }

        $student->created_at = date('Y-m-d H:i:s');
        $student->updated_at = date('Y-m-d H:i:s');

        if ($student->save()) {
            return [
                'status' => 'success',
                'message' => 'Student created successfully.',
                'student' => $student,
            ];
        }

        return ['status' => 'error', 'errors' => $student->errors];
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $student = Student::findOne($id);
        if (!$student) {
            return ['status' => 'error', 'message' => 'Student not found.'];
        }

        $data = Yii::$app->request->post();
        $student->attributes = $data;
        $student->updated_at = date('Y-m-d H:i:s');

        if ($student->save()) {
            // Handle assignment of studies using the AssignStudiesTrait method
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyIds = $data['study_ids'];

                // Assign studies to the school using the assignStudies method from the trait
                $assignedStudies = $this->assignStudies($school->user_id, $studyIds, 'school');
            } else {
                $assignedStudies = [];
            }

            return ['status' => 'success', 'student' => $student];
        }

        return ['status' => 'error', 'errors' => $student->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $student = Student::findOne($id);
        if (!$student) {
            return ['status' => 'error', 'message' => 'Student not found.'];
        }

        if ($student->delete()) {
            return ['status' => 'success', 'message' => 'Student deleted successfully.'];
        }

        return ['status' => 'error', 'message' => 'Failed to delete student.'];
    }
}
