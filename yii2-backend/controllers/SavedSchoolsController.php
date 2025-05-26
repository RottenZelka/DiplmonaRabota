<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\SavedSchools;
use app\models\School;
use app\models\Student;
use app\helpers\AuthHelper;
use app\helpers\PaginationHelper;

class SavedSchoolsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $search = Yii::$app->request->get('search', '');

        $query = SavedSchools::find()
            ->leftJoin('school', 'school.user_id = saved_schools.school_id')
            ->leftJoin('links', 'links.id = school.profile_photo_id')
            ->leftJoin('school_level_assignments', 'school_level_assignments.school_id = school.user_id')
            ->leftJoin('school_levels', 'school_levels.id = school_level_assignments.level_id')
            ->select([
                'saved_schools.*',
                'school.name as school_name',
                'school.description as school_description',
                'links.url as profile_photo_url',
                'GROUP_CONCAT(DISTINCT school_levels.name) as level_names'
            ])
            ->where(['saved_schools.student_id' => $authenticatedUser->user_id])
            ->groupBy('saved_schools.id');

        if (!empty($search)) {
            $query->andWhere(['like', 'school.name', $search]);
        }

        $paginatedData = PaginationHelper::paginate($query);

        foreach ($paginatedData['results'] as &$school) {
            $school['level_names'] = array_filter(explode(',', $school['level_names']));
        }

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'saved_schools' => $paginatedData['results'],
            'pagination' => $paginatedData['pagination']
        ];
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
