<?php

namespace app\controllers;

use app\models\SchoolLevels;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class SchoolLevelsController extends Controller
{
    /**
     * Fetch all available school levels.
     * Endpoint: GET /api/levels
     */
    public function actionGetLevels()
    {
        \Yii::$app->response->format = Response::FORMAT_JSON;

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

    /**
     * Fetch a single school level by ID.
     * Endpoint: GET /api/levels/<id>
     */
    public function actionGetLevel($id)
    {
        \Yii::$app->response->format = Response::FORMAT_JSON;

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
