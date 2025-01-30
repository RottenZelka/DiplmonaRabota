<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\ExamResults;
use app\models\StudentAnswers;

class ExamResultsController extends Controller
{
    public $enableCsrfValidation = false;

    // View results of an exam for a school
    public function actionViewResults($examId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $results = ExamResults::find()
            ->where(['exam_id' => $examId])
            ->asArray()
            ->all();

        return ['status' => 'success', 'results' => $results];
    }

    // Check an exam
    public function actionCheckExam($examId, $studentId)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $answers = StudentAnswers::find()
            ->where(['exam_id' => $examId, 'sudent_id' => $studentId])
            ->all();

        $totalPoints = 0;

        foreach ($answers as $answer) {
            // Manual check logic
            $points = $answer->points; // Assume points are set for each answer
            $totalPoints += $points;
        }

        $data = Yii::$app->request->post();

        $examResult = ExamResults::findOne(['exam_id' => $examId]);
        $examResult->score = $totalPoints;
        $examResult->checked_at = date('Y-m-d H:i:s');
        $examResult->commentary = $data['commentary'];
        $examResult->save();

        return ['status' => 'success', 'message' => 'Exam checked', 'score' => $totalPoints];
    }
}
