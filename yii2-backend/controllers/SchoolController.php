<?php
namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\School;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use app\controllers\AuthHelper;

class SchoolController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $schools = School::find()
            ->leftJoin('links', 'links.id = school.profile_photo_id')
            ->select(['school.*', 'links.url AS profile_photo_url'])
            ->asArray()
            ->all();

        return [
            'status' => 'success',
            'schools' => $schools,
        ];
    }


    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // Retrieve the school along with the image URL
        $school = School::find()
            ->leftJoin('links', 'links.id = school.profile_photo_id') // Join with links table to get the URL
            ->select(['school.*', 'links.url AS profile_photo_url']) // Select the URL as profile_photo_url
            ->where(['school.user_id' => $id])
            ->one();

        if ($school) {
            return [
                'status' => 'success',
                'school' => $school,
            ];
        }
        
        return ['status' => 'error', 'message' => 'School not found.'];
    }


    public function actionFilterByLevel($level)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $schools = School::find()->joinWith('schoolLevelAssignments')
            ->where(['school_level_assignments.level' => $level])->all();

        return [
            'status' => 'success',
            'schools' => $schools,
        ];
    }

    public function actionFilterByStudy($study)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $schools = School::find()->joinWith('schoolStudies')
            ->where(['school_studies.study_area' => $study])->all();

        return [
            'status' => 'success',
            'schools' => $schools,
        ];
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
    
        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }
    
        $data = Yii::$app->request->post();
    
        $transaction = Yii::$app->db->beginTransaction(); // Start transaction
    
        try {
            $school = new School();
            $school->user_id = $authenticatedUser->user_id; // Automatically set user_id from token
            $school->name = $data['name'] ?? null;
            $school->address = $data['address'] ?? null;
            $school->description = $data['description'] ?? null;
    
            // Handle new fields
            $school->school_year_start = $data['school_year_start'] ?? null;
            $school->school_year_end = $data['school_year_end'] ?? null;
            $school->primary_color = $data['primary_color'] ?? '#ffffff';
            $school->secondary_color = $data['secondary_color'] ?? '#000000';
    
            // Handle profile photo
            if (!empty($data['profile_photo_id'])) {
                $image = \app\models\Links::findOne($data['profile_photo_id']);
                if ($image) {
                    $school->profile_photo_id = $image->id;
                } else {
                    throw new \Exception('Invalid profile photo ID.');
                }
            }
    
            $school->created_at = date('Y-m-d H:i:s');
            $school->updated_at = date('Y-m-d H:i:s');
    
            if (!$school->save()) {
                throw new \Exception('Failed to save school: ' . json_encode($school->errors));
            }
    
            // Assign Levels using SchoolLevelAssignmentsController
            if (!empty($data['level_ids']) && is_array($data['level_ids'])) {
                $levelAssignmentController = new \app\controllers\SchoolLevelAssignmentsController('school-level-assign', Yii::$app);
                $levelAssignmentController->assignLevels($school->user_id, $data['level_ids']);
            }
    
            // Handle assignment of studies using the AssignStudiesTrait method
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new \app\controllers\UserStudiesController('school-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($school->user_id, $data['study_ids']);
            }
    
            $transaction->commit(); // Commit transaction if everything is successful
    
            return [
                'status' => 'success',
                'message' => 'School created successfully.',
                'school' => $school,
            ];
        } catch (\Exception $e) {
            $transaction->rollBack(); // Rollback transaction if an error occurs
            return [
                'status' => 'error',
                'message' => 'Failed to create school: ' . $e->getMessage(),
            ];
        }
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $school = School::findOne($id);
        if (!$school) {
            return ['status' => 'error', 'message' => 'School not found.'];
        }

        $data = Yii::$app->request->post();
        $school->attributes = $data;
        $school->updated_at = date('Y-m-d H:i:s');

        if ($school->save()) {
            // Assign Levels using SchoolLevelAssignController (this part stays the same)
            if (!empty($data['level_ids']) && is_array($data['level_ids'])) {
                $levelAssignmentController = new \app\controllers\SchoolLevelAssignmentsController('school-level-assign', Yii::$app);
                $levelAssignmentController->assignLevels($school->user_id, $data['level_ids']);
            }

            // Handle assignment of studies using the AssignStudiesTrait method
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new \app\controllers\UserStudiesController('school-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($school->user_id, $data['study_ids']);
            }

            return ['status' => 'success', 'school' => $school];
        }

        return ['status' => 'error', 'errors' => $school->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $school = School::findOne($id);
        if (!$school) {
            return ['status' => 'error', 'message' => 'School not found.'];
        }

        if ($school->delete()) {
            return ['status' => 'success', 'message' => 'School deleted successfully.'];
        }

        return ['status' => 'error', 'message' => 'Failed to delete school.'];
    }
}
