<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\ExamQuestions;
use app\models\StudentAnswers;
use app\controllers\AuthHelper;

class ExamQuestionsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionGetExamQuestions($examId, $questionId = null)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        if ($questionId) {
            $question = ExamQuestions::find()
                ->where(['exam_id' => $examId, 'id' => $questionId])
                ->asArray()
                ->one();

            if (!$question) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Question not found for the specified exam and question ID'];
            }

            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'question' => $question];
        } else {
            $questions = ExamQuestions::find()
                ->where(['exam_id' => $examId])
                ->asArray()
                ->all();

            if (empty($questions)) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'No questions found for the specified exam'];
            }

            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'questions' => $questions];
        }
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();
        $question = new ExamQuestions();

        $question->exam_id = $data['exam_id'];
        $question->question_text = $data['question_text'];
        $question->choices = $data['choices'];
        $question->correct_answer = $data['correct_answer'];
        $question->question_type = $data['question_type'];
        $question->max_points = $data['max_points'];
        $question->created_at = date('Y-m-d H:i:s');
        $question->updated_at = date('Y-m-d H:i:s');

        if ($question->save()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'question' => $question];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'errors' => $question->errors];
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $question = ExamQuestions::findOne($id);
        if (!$question) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Question not found'];
        }

        $data = Yii::$app->request->post();
        $question->attributes = $data;
        $question->updated_at = date('Y-m-d H:i:s');

        if ($question->save()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'question' => $question];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'errors' => $question->errors];
    }

    public function actionReviewQuestion($examId, $studentId, $questionId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $answer = StudentAnswers::find()
            ->where([
                'exam_id' => $examId,
                'student_id' => $studentId,
                'question_id' => $questionId
            ])
            ->one();

        if (!$answer) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Answer not found'];
        }

        $question = ExamQuestions::findOne($questionId);
        if (!$question) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Question not found'];
        }

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'question' => [
                'id' => $question->id,
                'text' => $question->question_text,
                'type' => $question->question_type,
                'max_points' => $question->max_points,
                'correct_answer' => $question->question_type === 'MCQ' ? $question->correct_answer : null
            ],
            'student_answer' => $answer->answer
        ];
    }

    public function actionCheckQuestion($examId, $studentId, $questionId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $answer = StudentAnswers::find()
            ->where([
                'exam_id' => $examId,
                'student_id' => $studentId,
                'question_id' => $questionId
            ])
            ->one();

        if (!$answer) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Answer not found'];
        }

        $question = ExamQuestions::findOne($questionId);
        if (!$question) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Question not found'];
        }

        $points = 0;
        $data = Yii::$app->request->post();

        if ($question->question_type === 'MCQ') {
            if ($answer->answer == $question->correct_answer) {
                $points = $question->max_points;
            }
        } else {
            $points = $data['points'];
        }
        
        $answer->commentary = $data['commentary'];
        $answer->points = $points;

        if ($answer->save()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'answer' => $answer];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'errors' => $answer->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $question = ExamQuestions::findOne($id);
        if (!$question) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Question not found'];
        }

        if ($question->delete()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'message' => 'Question deleted successfully'];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to delete question'];
    }

    public function actionQuestionTypes()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $questionTypes = $this->get_enum_values('exam_questions', 'question_type');
        
        Yii::$app->response->statusCode = 200;
        return [
            'types' => $questionTypes,
        ];
    }

    private function get_enum_values($table, $field)
    {
        $type = Yii::$app->db->createCommand("SHOW COLUMNS FROM {$table} WHERE Field = '{$field}'")->queryOne()['Type'];
        preg_match("/^enum\(\'(.*)\'\)$/", $type, $matches);
        $enum = explode("','", $matches[1]);

        return $enum;
    }

    public function actionRefreshToken()
    {
        return AuthHelper::handleRefreshToken();
    }
}