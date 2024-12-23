<?php
namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\School;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class SchoolController extends Controller
{
    use AssignStudiesTrait;

    private $jwtSecret = 'your-secret-key-here'; // Replace with a strong secret key

    public $enableCsrfValidation = false;

    private function validateJwt($token) {
        try {
            return JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
        } catch (\Exception $e) {
            return null; // Token invalid
        }
    }

    private function getAuthenticatedUser()
    {
        $authHeader = Yii::$app->request->headers->get('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return null;
        }
        $token = $matches[1];
        $decoded = $this->validateJwt($token);
        return $decoded ? $decoded->data : null;
    }

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $schools = School::find()->all();
        return [
            'status' => 'success',
            'schools' => $schools,
        ];
    }

    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $school = School::findOne($id);
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

        // Authenticate the user
        $authenticatedUser = $this->getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        // Collect POST data
        $data = Yii::$app->request->post();

        // Initialize new School model
        $school = new School();
        $school->name = $data['name'] ?? null;
        $school->address = $data['address'] ?? null;
        $school->description = $data['description'] ?? null;
        $school->profile_photo_id = $data['profile_photo_id'] ?? null; // Optional
        $school->created_at = date('Y-m-d H:i:s');
        $school->updated_at = date('Y-m-d H:i:s');

        // Save the school data
        if ($school->save()) {
            $schoolId = $school->id;

            // Assign Levels using SchoolLevelAssignController (this part stays the same)
            if (!empty($data['level_ids']) && is_array($data['level_ids'])) {
                $levelAssignmentController = new \app\controllers\SchoolLevelAssignmentsController('school-level-assign', Yii::$app);
                $levelAssignmentController->assignLevels($schoolId, $data['level_ids']);
            }

            // Handle assignment of studies using the AssignStudiesTrait method
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyIds = $data['study_ids'];

                // Assign studies to the school using the assignStudies method from the trait
                $assignedStudies = $this->assignStudies($schoolId, $studyIds, 'school');
            } else {
                $assignedStudies = [];
            }

            return [
                'status' => 'success',
                'message' => 'School created successfully.',
                'school' => $school,
            ];
        }

        // Handle validation errors
        return ['status' => 'error', 'errors' => $school->errors];
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = $this->getAuthenticatedUser();
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
            return ['status' => 'success', 'school' => $school];
        }

        return ['status' => 'error', 'errors' => $school->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = $this->getAuthenticatedUser();
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
