<?php
namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\School;
use app\helpers\AuthHelper;
use app\models\UserStudies;
use app\models\SchoolLevelAssignments;
use app\models\UserStudyAssignments;

class SchoolController extends Controller
{
    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:3000', 'http://192.168.1.103:3000'], // Allow requests from your frontend
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 86400,
            ],
        ];
    
        $behaviors['authenticator'] = [
            'class' => \yii\filters\auth\HttpBearerAuth::class,
            'only' => ['create', 'update', 'delete'], // Apply authentication only to these actions
        ];

        return $behaviors;
    }

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $query = School::find()
            ->leftJoin('links', 'links.id = school.profile_photo_id')
            ->select(['school.*', 'links.url AS profile_photo_url']);

        // Check for level filter (using level_ids array)
        $levelIds = Yii::$app->request->get('level_ids');
        if (!empty($levelIds) && is_array($levelIds)) {
            $query->leftJoin('school_level_assignments', 'school_level_assignments.school_id = school.user_id')
                ->andWhere(['in', 'school_level_assignments.level_id', $levelIds]);
        }

        // Check for study filter (using study_ids array)
        $studyIds = Yii::$app->request->get('study_ids');
        if (!empty($studyIds) && is_array($studyIds)) {
            $query->leftJoin('user_studies', 'user_studies.user_id = school.user_id')
                ->andWhere(['in', 'user_studies.study_id', $studyIds]);
        }

        // If authenticated user, arrange the schools in specific way
        $authUser = AuthHelper::getAuthenticatedUser();
        if ($authUser) {
            // Exclude the authenticated user from the list
            $query->andWhere(['!=', 'school.user_id', $authUser->user_id]);

            // Get the studies of the authenticated user
            $userStudies = UserStudies::find()
                ->select('study_id')
                ->where(['user_id' => $authUser->user_id])
                ->column();

            if (!empty($userStudies)) {
                // Count matching studies and order by the count
                $query->leftJoin('user_studies us', 'us.user_id = school.user_id AND us.study_id IN (' . implode(',', $userStudies) . ')')
                    ->select(['school.*', 'links.url AS profile_photo_url', 'COUNT(us.study_id) AS common_studies_count'])
                    ->groupBy('school.user_id')
                    ->orderBy(['common_studies_count' => SORT_DESC, 'school.user_id' => SORT_ASC]);
            }
        }

        // Ensure distinct schools if both filters are applied
        if ((!empty($levelIds) && is_array($levelIds)) || (!empty($studyIds) && is_array($studyIds))) {
             $query->distinct();
        }

        $schools = $query->asArray()->all();

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'schools' => $schools,
        ];
    }

    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $school = School::find()
            ->leftJoin('links', 'links.id = school.profile_photo_id')
            ->leftJoin('(SELECT user_id, GROUP_CONCAT(studies.name SEPARATOR ", ") AS study_names FROM user_studies 
                        JOIN studies ON studies.id = user_studies.study_id 
                        GROUP BY user_id) AS user_study_group', 'user_study_group.user_id = school.user_id')
            ->leftJoin('(SELECT school_id, GROUP_CONCAT(school_levels.name SEPARATOR ", ") AS level_names FROM school_level_assignments 
                        JOIN school_levels ON school_levels.id = school_level_assignments.level_id 
                        GROUP BY school_id) AS level_group', 'level_group.school_id = school.user_id')
            ->select([
                'school.*',
                'links.url AS profile_photo_url',
                'user_study_group.study_names',
                'level_group.level_names'
            ])
            ->where(['school.user_id' => $id])
            ->asArray()
            ->one();

        if ($school) {
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'school' => $school,
            ];
        }

        Yii::$app->response->statusCode = 404;
        return ['status' => 'error', 'message' => 'School not found.'];
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized. Only schools can create schools.'];
        }

        $data = Yii::$app->request->post();

        $transaction = Yii::$app->db->beginTransaction();

        try {
            $school = new School();
            $school->user_id = $authenticatedUser->user_id;
            $school->name = $data['name'] ?? null;
            $school->address = $data['address'] ?? null;
            $school->description = $data['description'] ?? null;

            $school->school_year_start = $data['school_year_start'] ?? null;
            $school->school_year_end = $data['school_year_end'] ?? null;
            $school->primary_color = $data['primary_color'] ?? '#ffffff';
            $school->secondary_color = $data['secondary_color'] ?? '#000000';

            if (!empty($data['profile_photo_file'])) {
                 $link = \app\helpers\FileHelper::uploadBase64Image($data['profile_photo_file']);
                 if ($link) {
                     $school->profile_photo_id = $link->id;
                 } else {
                     throw new \Exception('Failed to upload profile photo.');
                 }
             }

            $school->created_at = date('Y-m-d H:i:s');
            $school->updated_at = date('Y-m-d H:i:s');

            if (!$school->save()) {
                throw new \Exception('Failed to save school: ' . json_encode($school->errors));
            }

            if (!empty($data['level_ids']) && is_array($data['level_ids'])) {
                $levelAssignmentController = new \app\controllers\SchoolLevelAssignmentsController('school-level-assign', Yii::$app);
                $levelAssignmentController->assignLevels($school->user_id, $data['level_ids']);
            }

            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new \app\controllers\UserStudiesController('school-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($school->user_id, $data['study_ids']);
            }

            $transaction->commit();

            Yii::$app->response->statusCode = 201;
            return [
                'status' => 'success',
                'message' => 'School created successfully.',
                'school' => $school,
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 400;
            return [
                'status' => 'error',
                'message' => 'Failed to create school: ' . $e->getMessage(),
            ];
        }
    }

    public function actionUpdate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'school') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized. Only schools can update schools.'];
        }

        $school = School::findOne($authenticatedUser->user_id);
        if (!$school) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'School not found.'];
        }

        $data = Yii::$app->request->post();

        // Handle profile photo update
        if (isset($data['profile_photo_file'])) {
             // If photo data is null or empty, it means the user wants to remove the photo
            if (empty($data['profile_photo_file'])) {
                $school->profile_photo_id = null;
            } else {
                // Upload new photo and update the ID
                $link = \app\helpers\FileHelper::uploadBase64Image($data['profile_photo_file']);
                if ($link) {
                    $school->profile_photo_id = $link->id;
                } else {
                    // Handle upload failure
                    Yii::$app->response->statusCode = 400;
                    return ['status' => 'error', 'message' => 'Failed to upload profile photo.'];
                }
            }
        }


        $school->attributes = $data;
        $school->updated_at = date('Y-m-d H:i:s');

        if ($school->save()) {
            if (!empty($data['level_ids']) && is_array($data['level_ids'])) {
                $levelAssignmentController = new \app\controllers\SchoolLevelAssignmentsController('school-level-assign', Yii::$app);
                $levelAssignmentController->assignLevels($school->user_id, $data['level_ids']);
            }

            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new \app\controllers\UserStudiesController('school-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($school->user_id, $data['study_ids']);
            }

            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'school' => $school];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'errors' => $school->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        $school = School::findOne($id);

        if (!$authenticatedUser || !$school || $authenticatedUser->user_type !== 'school' || $authenticatedUser->user_id !== $school->user_id) {
             Yii::$app->response->statusCode = 401;
             return ['status' => 'error', 'message' => 'Unauthorized.'];
         }

        if ($school->delete())
        {
            Yii::$app->response->statusCode = 200; 
            return ['status' => 'success', 'message' => 'School deleted successfully.'];
        }
        else
        {
            Yii::$app->response->statusCode = 500; 
             return ['status' => 'error', 'message' => 'Failed to delete school.', 'errors' => $school->errors];
        }
    }

}