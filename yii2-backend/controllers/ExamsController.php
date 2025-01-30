<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Exams;
use app\controllers\AuthHelper;

class ExamsController extends Controller
{
    public $enableCsrfValidation = false;

    // Create an exam
    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();

        $exam = new Exams();
        $exam->school_id = $authenticatedUser->user_id;
        $exam->name = $data['name'] ?? null;
        $exam->time_needed_minutes = $data['time_needed_minutes'] ?? 60;
        $exam->is_mandatory = $data['is_mandatory'] ?? 0;
        $exam->created_at = date('Y-m-d H:i:s');
        $exam->updated_at = date('Y-m-d H:i:s');

        if ($exam->save()) {
            return ['status' => 'success', 'exam' => $exam];
        }

        return ['status' => 'error', 'message' => 'Failed to create exam', 'errors' => $exam->errors];
    }

    // Update an exam
    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $exam = Exams::findOne(['id' => $id, 'school_id' => $authenticatedUser->user_id]);
        if (!$exam) {
            return ['status' => 'error', 'message' => 'Exam not found'];
        }

        $data = Yii::$app->request->post();
        $exam->attributes = $data;
        $exam->updated_at = date('Y-m-d H:i:s');

        if ($exam->save()) {
            return ['status' => 'success', 'exam' => $exam];
        }

        return ['status' => 'error', 'errors' => $exam->errors];
    }

    // View Exam
    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $exam = Exams::findOne($id);
        if (!$exam) {
            return ['status' => 'error', 'message' => 'Exam not found'];
        }

        return ['status' => 'success', 'exam' => $exam];
    }

    // Delete an exam
    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $exam = Exams::findOne(['id' => $id, 'school_id' => $authenticatedUser->user_id]);
        if (!$exam) {
            return ['status' => 'error', 'message' => 'Exam not found'];
        }

        if ($exam->delete()) {
            return ['status' => 'success', 'message' => 'Exam deleted successfully'];
        }

        return ['status' => 'error', 'message' => 'Failed to delete exam'];
    }

    // List exams for students
    public function actionListExams($schoolId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $exams = Exams::find()
            ->where(['school_id' => $schoolId])
            ->asArray()
            ->all();

        return ['status' => 'success', 'exams' => $exams];
    }
}
