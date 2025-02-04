<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Exams;
use app\helpers\AuthHelper;

class ExamsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
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
            Yii::$app->response->statusCode = 201;
            return ['status' => 'success', 'exam' => $exam];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to create exam', 'errors' => $exam->errors];
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $exam = Exams::findOne(['id' => $id, 'school_id' => $authenticatedUser->user_id]);
        if (!$exam) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Exam not found'];
        }

        $data = Yii::$app->request->post();
        $exam->attributes = $data;
        $exam->updated_at = date('Y-m-d H:i:s');

        if ($exam->save()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'exam' => $exam];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'errors' => $exam->errors];
    }

    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $exam = Exams::findOne($id);
        if (!$exam) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Exam not found'];
        }

        Yii::$app->response->statusCode = 200;
        return ['status' => 'success', 'exam' => $exam];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $exam = Exams::findOne(['id' => $id, 'school_id' => $authenticatedUser->user_id]);
        if (!$exam) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Exam not found'];
        }

        if ($exam->delete()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'message' => 'Exam deleted successfully'];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to delete exam'];
    }

    public function actionListSchoolExams($schoolId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $exams = Exams::find()
            ->where(['school_id' => $schoolId])
            ->asArray()
            ->all();

        Yii::$app->response->statusCode = 200;
        return ['status' => 'success', 'exams' => $exams];
    }

    public function actionListExams()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $exams = Exams::find()
            ->asArray()
            ->all();

        Yii::$app->response->statusCode = 200;
        return ['status' => 'success', 'exams' => $exams];
    }
}