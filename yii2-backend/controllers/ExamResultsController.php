<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\ExamResults;
use app\models\StudentAnswers;
use app\models\ExamQuestions;
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

        // Authenticate the user
        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        // Fetch all answers for the exam and student
        $answers = StudentAnswers::find()
            ->where(['exam_id' => $examId, 'student_id' => $studentId])
            ->all();

        if (empty($answers)) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'No answers found for this exam and student'];
        }

        $totalPoints = 0;
        $data = Yii::$app->request->post();

        // Find or create ExamResults entry
        $examResult = ExamResults::findOne(['exam_id' => $examId, 'student_id' => $studentId]);

        if (!$examResult) {
            $examResult = new ExamResults();
            $examResult->exam_id = $examId;
            $examResult->student_id = $studentId;
        }

        // Check each question and calculate points
        foreach ($answers as $answer) {
            $question = ExamQuestions::findOne($answer->question_id);
            if (!$question) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Question not found'];
            }

            // Auto-check MCQ answers
            if ($question->question_type === 'MCQ') {
                // Split correct answers into an array
                $correctAnswers = explode(',', $question->correct_answer);

                // Split student's answer into an array
                $studentAnswers = explode(',', $answer->answer);

                // Calculate the number of correct answers
                $correctCount = count(array_intersect($studentAnswers, $correctAnswers));

                // Calculate points based on the ratio of correct answers
                $answer->points = ($correctCount / count($correctAnswers)) * $question->max_points;
            } else {
                // For non-MCQ, use the points provided in the request
                $answer->points = $data['points'][$answer->question_id] ?? 0;
            }

            // Add commentary if provided
            $answer->commentary = $data['commentary'][$answer->question_id] ?? null;

            // Save the updated answer
            if (!$answer->save()) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Failed to save answer', 'errors' => $answer->errors];
            }

            // Add points to the total score
            $totalPoints += $answer->points;
            $examResult->max_points += $question->max_points;
        }

        // Save the exam results
        $examResult->score = $totalPoints;
        $examResult->status = 'checked'; // Set status to "graded"
        $examResult->checked_at = date('Y-m-d H:i:s'); // Set check date
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