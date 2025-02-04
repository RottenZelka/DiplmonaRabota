<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\Period;
use app\helpers\AuthHelper;

class PeriodController extends Controller
{
    // Disable CSRF validation for this controller
    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $periods = Period::find()->all();
        Yii::$app->response->statusCode = 200;
        return ['status' => 'success', 'periods' => $periods];
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $model = new Period();

        if ($model->load(Yii::$app->request->post(), '') && $model->save()) {
            Yii::$app->response->statusCode = 201;
            return ['status' => 'success', 'period' => $model];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'errors' => $model->getErrors()];
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $period = Period::findOne($id);

        if ($period->load(Yii::$app->request->post(), '') && $period->save()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'period' => $period];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'errors' => $period->getErrors()];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $period = Period::findOne($id);
        if ($period->delete()) {
            Yii::$app->response->statusCode = 204;
            return ['status' => 'success', 'message' => 'Period deleted successfully'];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to delete period'];
    }
}