<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\ExamQuestions;
use app\models\StudentAnswers;

class ExamQuestionsController extends Controller
{
    public $enableCsrfValidation = false;

    // Get questions from an exam
    public function actionGetExamQuestions($examId, $questionId = null)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        if ($questionId) {
            // Fetch a specific question for the exam
            $question = ExamQuestions::find()
                ->where(['exam_id' => $examId, 'id' => $questionId])
                ->asArray()
                ->one();

            if (!$question) {
                return ['status' => 'error', 'message' => 'Question not found for the specified exam and question ID'];
            }

            return ['status' => 'success', 'question' => $question];
        } else {
            // Fetch all questions for the exam
            $questions = ExamQuestions::find()
                ->where(['exam_id' => $examId])
                ->asArray()
                ->all();

            if (empty($questions)) {
                return ['status' => 'error', 'message' => 'No questions found for the specified exam'];
            }

            return ['status' => 'success', 'questions' => $questions];
        }
    }

    // Add a question to an exam
    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

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
            return ['status' => 'success', 'question' => $question];
        }

        return ['status' => 'error', 'errors' => $question->errors];
    }

    // Update a question
    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $question = ExamQuestions::findOne($id);
        if (!$question) {
            return ['status' => 'error', 'message' => 'Question not found'];
        }

        $data = Yii::$app->request->post();
        $question->attributes = $data;
        $question->updated_at = date('Y-m-d H:i:s');

        if ($question->save()) {
            return ['status' => 'success', 'question' => $question];
        }

        return ['status' => 'error', 'errors' => $question->errors];
    }

    public function actionReviewQuestion($examId, $studentId, $questionId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // Fetch the student's answer
        $answer = StudentAnswers::find()
            ->where([
                'exam_id' => $examId,
                'student_id' => $studentId,
                'question_id' => $questionId
            ])
            ->one();

        if (!$answer) {
            return ['status' => 'error', 'message' => 'Answer not found'];
        }

        // Fetch the question
        $question = ExamQuestions::findOne($questionId);
        if (!$question) {
            return ['status' => 'error', 'message' => 'Question not found'];
        }

        // Return the question and student's answer for review
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


    // Check a question
    public function actionCheckQuestion($examId, $studentId, $questionId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $answer = StudentAnswers::find()
            ->where([
                'exam_id' => $examId,
                'student_id' => $studentId,
                'question_id' => $questionId
            ])
            ->one();

        if (!$answer) {
            return ['status' => 'error', 'message' => 'Answer not found'];
        }

        $question = ExamQuestions::findOne($questionId);
        if (!$question) {
            return ['status' => 'error', 'message' => 'Question not found'];
        }

        // Check the answer and assign points
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
            return ['status' => 'success', 'answer' => $answer];
        }

        return ['status' => 'error', 'errors' => $answer->errors];
    }

    // Delete a question
    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $question = ExamQuestions::findOne($id);
        if (!$question) {
            return ['status' => 'error', 'message' => 'Question not found'];
        }

        if ($question->delete()) {
            return ['status' => 'success', 'message' => 'Question deleted successfully'];
        }

        return ['status' => 'error', 'message' => 'Failed to delete question'];
    }

    public function actionQuestionTypes()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // Fetch ENUM values for the `question_type` field from the `exam_questions` table
        $questionTypes = $this->get_enum_values('exam_questions', 'question_type');

        return [
            'types' => $questionTypes,
        ];
    }

    /**
     * Fetch ENUM values from a MySQL table field.
     *
     * @param string $table The table name.
     * @param string $field The field name.
     * @return array The ENUM values.
     */
    private function get_enum_values($table, $field)
    {
        // Fetch the column type from the database
        $type = Yii::$app->db->createCommand("SHOW COLUMNS FROM {$table} WHERE Field = '{$field}'")->queryOne()['Type'];

        // Extract ENUM values using regex
        preg_match("/^enum\(\'(.*)\'\)$/", $type, $matches);
        $enum = explode("','", $matches[1]);

        return $enum;
    }
}
