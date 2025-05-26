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
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $page = (int)Yii::$app->request->get('page', 1);
        $pageSize = (int)Yii::$app->request->get('page_size', 21);
        $search = Yii::$app->request->get('search', '');

        $query = Period::find()
            ->leftJoin('student', 'student.user_id = period.student_id')
            ->select([
                'period.*',
                'student.name as student_name'
            ])
            ->where(['period.school_id' => $authenticatedUser->user_id]);

        if (!empty($search)) {
            $query->andWhere(['like', 'period.name', $search]);
        }

        $totalCount = $query->count();
        $totalPages = ceil($totalCount / $pageSize);

        $periods = $query->offset(($page - 1) * $pageSize)
            ->limit($pageSize)
            ->asArray()
            ->all();

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'periods' => $periods,
            'pagination' => [
                'total_count' => $totalCount,
                'page_count' => $totalPages,
                'current_page' => $page,
                'page_size' => $pageSize
            ]
        ];
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