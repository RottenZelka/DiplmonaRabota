<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\ExamResults;
use app\models\StudentAnswers;
use app\models\ExamQuestions;
use app\helpers\AuthHelper;

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

    public function actionViewPendingExams($examId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $results = ExamResults::find()
            ->where(['exam_id' => $examId, 'status' => 'pending'])
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

        if (empty($answers)) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'No answers found for this exam and student'];
        }

        $totalPoints = 0;
        $data = Yii::$app->request->post();

        $examResult = ExamResults::findOne(['exam_id' => $examId, 'student_id' => $studentId]);
        
        //exam result creation if not exist
        if (!$examResult) {
            $examResult = new ExamResults();
            $examResult->exam_id = $examId;
            $examResult->student_id = $studentId;
        }

        foreach ($answers as $answer) {
            $question = ExamQuestions::findOne($answer->question_id);
            if (!$question) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Question not found'];
            }

            if ($question->question_type === 'MCQ') {
                $correctAnswers = explode(',', $question->correct_answer);
                $studentAnswers = explode(',', $answer->answer);
                $correctCount = count(array_intersect($studentAnswers, $correctAnswers));
                
                if($correctCount === count($correctAnswers))
                    $answer->points =  $question->max_points;
                else
                    $answer->points = $data['points'][$answer->question_id] ?? 0;
            } else {
                $answer->points = $data['points'][$answer->question_id] ?? 0;
            }

            $answer->commentary = $data['commentary'][$answer->question_id] ?? null;

            if (!$answer->save()) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Failed to save answer', 'errors' => $answer->errors];
            }

            $totalPoints += $answer->points;
            $examResult->max_points += $question->max_points;
        }

        $examResult->score = $totalPoints;
        $examResult->status = 'checked';
        $examResult->checked_at = date('Y-m-d H:i:s');
        $examResult->commentary = $data['commentary'] ?? null;

        if ($examResult->save()) {
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'message' => 'Exam checked successfully',
                'score' => $totalPoints,
            ];
        }

        Yii::$app->response->statusCode = 400;
        return [
            'status' => 'error',
            'message' => 'Failed to save exam results',
            'errors' => $examResult->errors,
        ];
    }
}
