<?php

namespace app\controllers;

use app\models\Studies;
use yii\web\Controller;
use yii\web\Response;
use yii\web\NotFoundHttpException;

/**
 * StudiesController implements the API endpoint for fetching studies.
 */
class StudiesController extends Controller
{
    /**
     * Fetch all available studies.
     * Endpoint: GET /api/studies
     */
    public function actionGetStudies()
    {
        \Yii::$app->response->format = Response::FORMAT_JSON;

        $studies = Studies::find()->all();

        if ($studies) {
            return [
                'status' => 'success',
                'studies' => $studies,
            ];
        }

        return [
            'status' => 'error',
            'message' => 'No studies found.',
        ];
    }

    /**
     * Fetch a single study by ID.
     * Endpoint: GET /api/studies/<id>
     */
    public function actionGetStudy($id)
    {
        \Yii::$app->response->format = Response::FORMAT_JSON;

        $study = Studies::findOne($id);

        if ($study) {
            return [
                'status' => 'success',
                'study' => $study,
            ];
        }

        return [
            'status' => 'error',
            'message' => 'Study not found.',
        ];
    }
}
