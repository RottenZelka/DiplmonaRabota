<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\StudentAnswers;
use app\models\Exams;
use app\models\ExamResults;
use app\models\ExamQuestions;
use app\helpers\AuthHelper;

class StudentAnswersController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionSubmit()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $data = Yii::$app->request->post();
        $examId = $data['exam_id'] ?? null;

        if (!$examId) {
            Yii::$app->response->statusCode = 428;
            return ['status' => 'error', 'message' => 'Exam ID is required.'];
        }

        $answers = $data['answers'] ?? [];
        if (empty($answers) || !is_array($answers)) {
            Yii::$app->response->statusCode = 428;
            return ['status' => 'error', 'message' => 'Answers are required.'];
        }

        $transaction = Yii::$app->db->beginTransaction();

        try {
            // write the data in the database
            foreach ($answers as $answerData) {
                $answer = new StudentAnswers();
                $answer->student_id = $authenticatedUser->user_id;
                $answer->exam_id = $examId;
                $answer->question_id = $answerData['question_id'];
                $answer->answer = $answerData['answer'];
                $answer->created_at = date('Y-m-d H:i:s');
                $answer->updated_at = date('Y-m-d H:i:s');

                if (!$answer->save()) {
                    throw new \Exception('Failed to save answer: ' . json_encode($answer->errors));
                }
            }

            $studentId = $authenticatedUser->user_id;
            $examResult = ExamResults::findOne(['exam_id' => $examId, 'student_id' => $studentId]);

            if (!$examResult) {
                $examResult = new ExamResults();
                $examResult->exam_id = $examId;
                $examResult->student_id = $studentId;
            }

            $examResult->score = 0;
            $examResult->status = 'pending';
            $examResult->checked_at = null;
            $examResult->commentary = null;

            if (!$examResult->save()) {
                throw new \Exception('Failed to save exam results: ' . json_encode($examResult->errors));
            }

            $transaction->commit();

            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'message' => 'Answers submitted successfully. Waiting for school to check the exam.',
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 400;
            return [
                'status' => 'error',
                'message' => 'Failed to save exam results',
                'errors' => $e->getMessage(),
            ];
        }
    }

    public function actionViewResults()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $results = ExamResults::find()
            ->select([
                'exam_results.*',
                'exams.name as exam_name',
                'exams.created_at as exam_created_at'
            ])
            ->leftJoin('exams', 'exams.id = exam_results.exam_id')
            ->where(['exam_results.student_id' => $authenticatedUser->user_id])
            ->asArray()
            ->all();

        Yii::$app->response->statusCode = 200;
        return ['status' => 'success', 'results' => $results];
    }

    public function actionViewExams($schoolId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $exams = Exams::find()
            ->where(['school_id' => $schoolId])
            ->asArray()
            ->all();

        Yii::$app->response->statusCode = 200;
        return ['status' => 'success', 'exams' => $exams];
    }

    public function actionCheckStatus($examId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $examResult = ExamResults::findOne(['exam_id' => $examId, 'student_id' => $authenticatedUser->user_id]);

        if (!$examResult) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Exam result not found'];
        }

        Yii::$app->response->statusCode = 200;
        return ['status' => 'success', 'status' => $examResult->status];
    }

    public function actionGetExamResults($examId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $studentId = $authenticatedUser->user_id;

        // Get the exam result
        $examResult = ExamResults::findOne([
            'exam_id' => $examId,
            'student_id' => $studentId
        ]);

        if (!$examResult) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Exam result not found.'];
        }

        // Get all questions for the exam
        $questions = ExamQuestions::find()
            ->where(['exam_id' => $examId])
            ->asArray()
            ->all();

        if (empty($questions)) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'No questions found for this exam.'];
        }

        // Get all student answers for this exam
        $answers = StudentAnswers::find()
            ->where([
                'exam_id' => $examId,
                'student_id' => $studentId
            ])
            ->asArray()
            ->all();

        // Create a map of question_id to answer for easier lookup
        $answerMap = [];
        foreach ($answers as $answer) {
            $answerMap[$answer['question_id']] = $answer;
        }

        // Combine questions with their answers
        $results = [];
        foreach ($questions as $question) {
            $answer = $answerMap[$question['id']] ?? null;
            
            $results[] = [
                'question' => [
                    'id' => $question['id'],
                    'question_text' => $question['question_text'],
                    'question_type' => $question['question_type'],
                    'max_points' => $question['max_points'],
                    'correct_answer' => $question['question_type'] === 'MCQ' ? $question['correct_answer'] : null,
                    'choices' => $question['choices']
                ],
                'student_answer' => $answer ? $answer['answer'] : '',
                'points' => $answer ? $answer['points'] : 0,
                'commentary' => $answer ? $answer['commentary'] : null
            ];
        }

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'exam_result' => [
                'id' => $examResult->id,
                'score' => $examResult->score,
                'max_points' => $examResult->max_points,
                'status' => $examResult->status,
                'checked_at' => $examResult->checked_at,
                'commentary' => $examResult->commentary
            ],
            'results' => $results
        ];
    }
}