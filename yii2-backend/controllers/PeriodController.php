<?php

namespace app\controllers;

use Yii;
use yii\rest\ActiveController;
use yii\filters\Cors;
use yii\web\NotFoundHttpException;
use app\models\Period;

class PeriodController extends ActiveController
{
    public $modelClass = 'app\models\Period';

    /**
     * Add behaviors for CORS and other functionalities.
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        // CORS Support
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => ['*'], // Allow all origins
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 3600,
                'Access-Control-Allow-Headers' => ['*'], // Allow all headers
            ],
        ];

        return $behaviors;
    }

    /**
     * Override the action for options pre-flight requests.
     */
    public function actionOptions($id = null)
    {
        Yii::$app->getResponse()->getHeaders()->set('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
    }

    /**
     * Lists all Period models.
     * @return \yii\data\ActiveDataProvider
     */
    public function actionIndex()
    {
        return Period::find()->all();
    }

    /**
     * Creates a new Period model.
     * @return Period|array
     */
    public function actionCreate()
    {
        $model = new Period();

        if ($model->load(Yii::$app->request->post(), '') && $model->save()) {
            Yii::$app->response->statusCode = 201; // Created
            return $model;
        }

        Yii::$app->response->statusCode = 400; // Bad Request
        return $model->getErrors();
    }

    /**
     * Updates an existing Period model.
     * @param int $id
     * @return Period|array
     * @throws NotFoundHttpException if the model cannot be found
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post(), '') && $model->save()) {
            return $model;
        }

        Yii::$app->response->statusCode = 400; // Bad Request
        return $model->getErrors();
    }

    /**
     * Deletes an existing Period model.
     * @param int $id
     * @return bool
     * @throws NotFoundHttpException if the model cannot be found
     */
    public function actionDelete($id)
    {
        $model = $this->findModel($id);
        if ($model->delete()) {
            Yii::$app->response->statusCode = 204; // No Content
            return true;
        }

        Yii::$app->response->statusCode = 400; // Bad Request
        return false;
    }

    /**
     * Finds the Period model based on its primary key value.
     * @param int $id
     * @return Period
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Period::findOne($id)) !== null) {
            return $model;
        }

        throw new NotFoundHttpException('The requested Period does not exist.');
    }
}
