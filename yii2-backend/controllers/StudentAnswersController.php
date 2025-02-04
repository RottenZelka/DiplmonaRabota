<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\StudentAnswers;
use app\models\Exams;
use app\models\ExamResults;
use app\controllers\AuthHelper;

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
            ->where(['student_id' => $authenticatedUser->user_id])
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
}