<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\Studies;

class StudiesController extends Controller
{
    public function actionGetStudies()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $studies = Studies::find()->all();

        if ($studies) {
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'studies' => $studies,
            ];
        }

        Yii::$app->response->statusCode = 404;
        return [
            'status' => 'error',
            'message' => 'No studies found.',
        ];
    }

    public function actionGetStudy($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $study = Studies::findOne($id);

        if ($study) {
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'study' => $study,
            ];
        }

        Yii::$app->response->statusCode = 404;
        return [
            'status' => 'error',
            'message' => 'Study not found.',
        ];
    }
}