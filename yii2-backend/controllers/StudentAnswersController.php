<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\StudentAnswers;
use app\models\ExamQuestions;
use app\models\StudentExams;
use app\controllers\AuthHelper;

class StudentAnswersController extends Controller
{
    public $enableCsrfValidation = false;

    /**
     * Action to submit or update an answer.
     */
    public function actionSubmit()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();
        if (empty($data['exam_id']) || empty($data['question_id'])) {
            return ['status' => 'error', 'message' => 'exam_id and question_id are required.'];
        }

        $studentId = $authenticatedUser->user_id;
        $examId = $data['exam_id'];
        $questionId = $data['question_id'];
        $answer = $data['answer'] ?? null;

        // Check if the student is registered for the exam
        // $studentExam = StudentExams::find()
        //     ->where(['student_id' => $studentId, 'exam_id' => $examId])
        //     ->one();

        // if (!$studentExam) {
        //     return ['status' => 'error', 'message' => 'You are not registered for this exam.'];
        // }

        // Check if the question exists in the exam
        $examQuestion = ExamQuestions::find()
            ->where(['id' => $questionId, 'exam_id' => $examId])
            ->one();

        if (!$examQuestion) {
            return ['status' => 'error', 'message' => 'Invalid question for the specified exam.'];
        }

        // Find or create a StudentAnswers record
        $studentAnswer = StudentAnswers::find()
            ->where(['student_id' => $studentId, 'exam_id' => $examId, 'question_id' => $questionId])
            ->one();

        if (!$studentAnswer) {
            $studentAnswer = new StudentAnswers();
            $studentAnswer->student_id = $studentId;
            $studentAnswer->exam_id = $examId;
            $studentAnswer->question_id = $questionId;
            $studentAnswer->created_at = date('Y-m-d H:i:s');
        }

        // Update or set the answer
        $studentAnswer->answer = $answer;
        $studentAnswer->updated_at = date('Y-m-d H:i:s');

        if ($studentAnswer->save()) {
            return [
                'status' => 'success',
                'message' => 'Answer submitted successfully.',
                'answer' => $studentAnswer
            ];
        }

        return ['status' => 'error', 'message' => 'Failed to submit the answer.', 'errors' => $studentAnswer->errors];
    }

    /**
     * Action to view answers for a specific exam.
     */
    public function actionViewExamAnswers($exam_id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
    
        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }
    
        $studentId = $authenticatedUser->user_id;
    
        // Fetch answers for the specific exam along with question details
        $answers = StudentAnswers::find()
            ->alias('sa')
            ->leftJoin('exam_questions eq', 'eq.id = sa.question_id')
            ->where(['sa.student_id' => $studentId, 'sa.exam_id' => $exam_id])
            ->select([
                'sa.id AS answer_id',
                'sa.question_id',
                'sa.answer AS student_answer',
                'eq.question_text',
                'eq.type AS question_type',
                'eq.correct_answer',
                'eq.choices'
            ])
            ->asArray()
            ->all();
    
        if (!$answers) {
            return [
                'status' => 'error',
                'message' => 'No answers found for this exam.'
            ];
        }
    
        // Dynamically check if the student's answer is correct
        $formattedAnswers = array_map(function ($answer) {
            $isCorrect = null;
    
            // Check for MCQ questions
            if ($answer['question_type'] === 'MCQ') {
                $isCorrect = $answer['student_answer'] === $answer['correct_answer'] ? 1 : 0;
            }
    
            return [
                'answer_id' => $answer['answer_id'],
                'question_id' => $answer['question_id'],
                'question_text' => $answer['question_text'],
                'question_type' => $answer['question_type'],
                'student_answer' => $answer['student_answer'],
                'correct_answer' => $answer['correct_answer'],
                'is_correct' => $isCorrect,
                'choices' => json_decode($answer['choices']) // Decode JSON choices
            ];
        }, $answers);
    
        return [
            'status' => 'success',
            'answers' => $formattedAnswers
        ];
    }
    

    /**
     * Action to delete an answer (optional).
     */
    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $studentAnswer = StudentAnswers::findOne($id);
        if (!$studentAnswer || $studentAnswer->student_id !== $authenticatedUser->user_id) {
            return ['status' => 'error', 'message' => 'Answer not found or unauthorized to delete.'];
        }

        if ($studentAnswer->delete()) {
            return ['status' => 'success', 'message' => 'Answer deleted successfully.'];
        }

        return ['status' => 'error', 'message' => 'Failed to delete the answer.'];
    }
}
