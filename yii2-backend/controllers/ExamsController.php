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

    public function actionIndex($school_id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $exams = Exams::find()
            ->where(['school_id' => $school_id])
            ->asArray()
            ->all();

        return [
            'status' => 'success',
            'exams' => $exams,
        ];
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();

        $exam = new Exams();
        $exam->attributes = $data;
        $exam->school_id = $authenticatedUser->user_id; // Set school_id from authenticated user
        $exam->created_at = date('Y-m-d H:i:s');
        $exam->updated_at = date('Y-m-d H:i:s');

        if ($exam->save()) {
            return [
                'status' => 'success',
                'message' => 'Exam created successfully.',
                'exam' => $exam,
            ];
        }

        return ['status' => 'error', 'errors' => $exam->errors];
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $exam = Exams::findOne($id);
        if (!$exam) {
            return ['status' => 'error', 'message' => 'Exam not found.'];
        }

        $data = Yii::$app->request->post();
        $exam->attributes = $data;
        $exam->updated_at = date('Y-m-d H:i:s');

        if ($exam->save()) {
            return [
                'status' => 'success',
                'message' => 'Exam updated successfully.',
                'exam' => $exam,
            ];
        }

        return ['status' => 'error', 'errors' => $exam->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $exam = Exams::findOne($id);
        if (!$exam) {
            return ['status' => 'error', 'message' => 'Exam not found.'];
        }

        if ($exam->delete()) {
            return ['status' => 'success', 'message' => 'Exam deleted successfully.'];
        }

        return ['status' => 'error', 'message' => 'Failed to delete exam.'];
    }
}
