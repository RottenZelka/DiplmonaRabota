<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\StudentAnswers;
use app\models\Exams;
use app\models\ExamResults;

class StudentAnswersController extends Controller
{
    public $enableCsrfValidation = false;

    // Submit answers for an exam
    public function actionSubmit()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();
        $examId = $data['exam_id'] ?? null;

        if (!$examId) {
            return ['status' => 'error', 'message' => 'Exam ID is required'];
        }

        $answers = $data['answers'] ?? [];
        if (empty($answers) || !is_array($answers)) {
            return ['status' => 'error', 'message' => 'Answers are required'];
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

            $transaction->commit();

            return ['status' => 'success', 'message' => 'Answers submitted successfully'];
        } catch (\Exception $e) {
            $transaction->rollBack();
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    // View results of the student
    public function actionViewResults()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $results = ExamResults::find()
            ->where(['student_id' => $authenticatedUser->user_id])
            ->asArray()
            ->all();

        return ['status' => 'success', 'results' => $results];
    }

    // View exams available for a school
    public function actionViewExams($schoolId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $exams = Exams::find()
            ->where(['school_id' => $schoolId])
            ->asArray()
            ->all();

        return ['status' => 'success', 'exams' => $exams];
    }
}
