<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\ExamResults;
use app\models\StudentAnswers;
use app\controllers\AuthHelper;

class ExamResultsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionViewResults($examId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $results = ExamResults::find()
            ->where(['exam_id' => $examId])
            ->asArray()
            ->all();

        Yii::$app->response->statusCode = 200;
        return ['status' => 'success', 'results' => $results];
    }

    public function actionCheckExam($examId, $studentId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $answers = StudentAnswers::find()
            ->where(['exam_id' => $examId, 'student_id' => $studentId])
            ->all();

        $totalPoints = 0;

        foreach ($answers as $answer) {
            $points = $answer->points;
            $totalPoints += $points;
        }

        $data = Yii::$app->request->post();

        $examResult = ExamResults::findOne(['exam_id' => $examId]);
        $examResult->score = $totalPoints;
        $examResult->checked_at = date('Y-m-d H:i:s');
        $examResult->commentary = $data['commentary'];

        if ($examResult->save()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'message' => 'Exam checked', 'score' => $totalPoints];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to save exam results', 'errors' => $examResult->errors];
    }

    public function actionRefreshToken()
    {
        return AuthHelper::handleRefreshToken();
    }
}