<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Student;
use app\controllers\AuthHelper;
use app\models\Links;
use app\controllers\UserStudiesController;

class StudentController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $students = Student::find()
            ->leftJoin('links', 'links.id = student.profile_photo_id')
            ->select(['student.*', 'links.url AS profile_photo_url'])
            ->asArray()
            ->all();

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'students' => $students,
        ];
    }

    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $student = Student::find()
            ->leftJoin('links', 'links.id = student.profile_photo_id')
            ->leftJoin('user_studies', 'user_studies.user_id = student.user_id')
            ->leftJoin('studies', 'studies.id = user_studies.study_id')
            ->leftJoin('period', 'period.student_id = student.user_id')
            ->leftJoin('school', 'school.user_id = period.school_id')
            ->select([
                'student.*',
                'links.url AS profile_photo_url',
                'GROUP_CONCAT(studies.name) AS study_names',
                'GROUP_CONCAT(DISTINCT school.name) AS school_names',
                'GROUP_CONCAT(DISTINCT CONCAT(period.name, " (", period.start_date, " to ", period.end_date, ")")) AS periods'
            ])
            ->where(['student.user_id' => $id])
            ->groupBy('student.user_id')
            ->asArray()
            ->one();

        if ($student) {
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'student' => $student,
            ];
        }

        Yii::$app->response->statusCode = 404;
        return ['status' => 'error', 'message' => 'Student not found.'];
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $data = Yii::$app->request->post();
        $transaction = Yii::$app->db->beginTransaction();

        try {
            $student = new Student();
            $student->user_id = $authenticatedUser->user_id;
            $student->name = $data['name'] ?? null;
            $student->dob = $data['dob'] ?? null;

            if (!empty($data['profile_photo_id'])) {
                $image = Links::findOne($data['profile_photo_id']);
                if ($image) {
                    $student->profile_photo_id = $image->id;
                } else {
                    Yii::$app->response->statusCode = 400;
                    return ['status' => 'error', 'message' => 'Invalid profile photo ID.'];
                }
            }

            $student->created_at = date('Y-m-d H:i:s');
            $student->updated_at = date('Y-m-d H:i:s');

            if (!$student->save()) {
                throw new \Exception('Failed to save student: ' . json_encode($student->errors));
            }

            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new \app\controllers\UserStudiesController('student-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($student->user_id, $data['study_ids']);
            }

            $transaction->commit();
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'message' => 'Student created successfully.',
                'student' => $student,
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 500;
            return [
                'status' => 'error',
                'message' => 'Failed to create student: ' . $e->getMessage(),
            ];
        }
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $student = Student::findOne($id);
        if (!$student) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Student not found.'];
        }

        $data = Yii::$app->request->post();
        $student->attributes = $data;
        $student->updated_at = date('Y-m-d H:i:s');

        if ($student->save()) {
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new UserStudiesController('student-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($student->user_id, $data['study_ids']);
            }

            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'student' => $student];
        }

        Yii::$app->response->statusCode = 500;
        return ['status' => 'error', 'errors' => $student->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $student = Student::findOne($id);
        if (!$student) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Student not found.'];
        }

        if ($student->delete()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'message' => 'Student deleted successfully.'];
        }

        Yii::$app->response->statusCode = 500;
        return ['status' => 'error', 'message' => 'Failed to delete student.'];
    }
}