<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\ExamQuestions;
use app\controllers\AuthHelper;

class ExamQuestionsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionExamQuestions($exam_id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $questions = ExamQuestions::find()
            ->where(['exam_id' => $exam_id])
            ->asArray()
            ->all();

        return [
            'status' => 'success',
            'questions' => $questions,
        ];
    }

    public function actionAddQuestion()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();
        $question = new ExamQuestions();
        $question->attributes = $data;

        if ($question->save()) {
            return [
                'status' => 'success',
                'message' => 'Question added successfully.',
                'question' => $question,
            ];
        }

        return ['status' => 'error', 'errors' => $question->errors];
    }
}
