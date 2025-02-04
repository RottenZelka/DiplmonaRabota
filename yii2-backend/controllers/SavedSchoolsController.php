<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\SavedSchools;
use app\models\School;
use app\models\Student;

class SavedSchoolsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $savedSchools = SavedSchools::find()->all();

        $data = [];
        foreach ($savedSchools as $savedSchool) {
            $data[] = [
                'id' => $savedSchool->id,
                'student_id' => $savedSchool->student_id,
                'school_id' => $savedSchool->school_id,
                'school_name' => $savedSchool->school->name,
                'student_name' => $savedSchool->student->name,
            ];
        }

        return $data;
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $request = Yii::$app->request;
        $studentId = $request->post('student_id');
        $schoolId = $request->post('school_id');

        if (!$studentId || !$schoolId) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Student ID and School ID are required.'];
        }

        $student = Student::findOne($studentId);
        $school = School::findOne($schoolId);

        if (!$student || !$school) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Student or School not found.'];
        }

        $duplicate = SavedSchools::find()
            ->where(['school_id' => $schoolId, 'student_id' => $studentId])
            ->one();

        if($duplicate){
            Yii::$app->response->statusCode = 409;
            return ['status' => 'error', 'message' => 'Saved School already existing!'];
        }

        $savedSchool = new SavedSchools();
        $savedSchool->student_id = $studentId;
        $savedSchool->school_id = $schoolId;

        if ($savedSchool->save()) {
            Yii::$app->response->statusCode = 201;
            return ['status' => 'success', 'message' => 'Saved School created successfully.'];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to create Saved School.', 'errors' => $savedSchool->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $savedSchool = SavedSchools::findOne($id);

        if (!$savedSchool) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Saved School not found.'];
        }

        if ($savedSchool->delete()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'message' => 'Saved School deleted successfully.'];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to delete Saved School.', 'errors' => $savedSchool->errors];
    }

    public function actionDeleteId($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $savedSchool = SavedSchools::find()
            ->where(['school_id' => $id])
            ->one();

        if (!$savedSchool) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Saved School not found.'];
        }

        if ($savedSchool->delete()) {
            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'message' => 'Saved School deleted successfully.'];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to delete Saved School.', 'errors' => $savedSchool->errors];
    }
}
