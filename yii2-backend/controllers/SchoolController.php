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

        $schools = School::find()
            ->leftJoin('images', 'images.id = school.profile_photo_id')
            ->select(['school.*', 'images.url AS profile_photo_url'])
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
            ->leftJoin('images', 'images.id = school.profile_photo_id') // Join with images table to get the URL
            ->select(['school.*', 'images.url AS profile_photo_url']) // Select the URL as profile_photo_url
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

        $authenticatedUser = $this->getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $data = Yii::$app->request->post();

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
            $image = \app\models\Images::findOne($data['profile_photo_id']);
            if ($image) {
                $school->profile_photo_id = $image->id;
            } else {
                return ['status' => 'error', 'message' => 'Invalid profile photo ID.'];
            }
        }

        $school->created_at = date('Y-m-d H:i:s');
        $school->updated_at = date('Y-m-d H:i:s');

        if ($school->save()) {
            return [
                'status' => 'success',
                'message' => 'School created successfully.',
                'school' => $school,
            ];
        }

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
