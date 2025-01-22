<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\StudentExams;
use app\controllers\AuthHelper;

class StudentExamsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionStudentExams($student_id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $studentExams = StudentExams::find()
            ->where(['student_id' => $student_id])
            ->asArray()
            ->all();

        return [
            'status' => 'success',
            'student_exams' => $studentExams,
        ];
    }

    public function actionAssignToStudent()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();
        $studentExam = new StudentExams();
        $studentExam->attributes = $data;

        if ($studentExam->save()) {
            return [
                'status' => 'success',
                'message' => 'Exam assigned to student successfully.',
                'student_exam' => $studentExam,
            ];
        }

        return ['status' => 'error', 'errors' => $studentExam->errors];
    }
}
