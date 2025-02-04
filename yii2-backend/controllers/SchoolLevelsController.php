<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\SchoolLevels;

class SchoolLevelsController extends Controller
{
    public function actionGetLevels()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $levels = SchoolLevels::find()->all();

        if ($levels) {
            return [
                'status' => 'success',
                'levels' => $levels,
            ];
        }

        return [
            'status' => 'error',
            'message' => 'No levels found.',
        ];
    }

    public function actionGetLevel($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $level = SchoolLevels::findOne($id);

        if ($level) {
            return [
                'status' => 'success',
                'level' => $level,
            ];
        }

        return [
            'status' => 'error',
            'message' => 'Level not found.',
        ];
    }
}