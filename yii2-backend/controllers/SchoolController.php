<?php
namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\School;
use app\helpers\AuthHelper;
use app\models\UserStudies;

class SchoolController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $query = School::find()
            ->leftJoin('links', 'links.id = school.profile_photo_id')
            ->select(['school.*', 'links.url AS profile_photo_url']);

        $levelIds = Yii::$app->request->get('level_ids');
        $studyIds = Yii::$app->request->get('study_ids');
        $page = (int)Yii::$app->request->get('page', 1);
        $pageSize = (int)Yii::$app->request->get('page_size', 21);

        if (!empty($levelIds) && is_array($levelIds)) {
            $query->leftJoin('school_level_assignments', 'school_level_assignments.school_id = school.user_id')
                ->andWhere(['in', 'school_level_assignments.level_id', $levelIds]);
        }

        if (!empty($studyIds) && is_array($studyIds)) {
            $query->leftJoin('user_studies', 'user_studies.user_id = school.user_id')
                ->andWhere(['in', 'user_studies.study_id', $studyIds]);
        }

        $authUser = AuthHelper::getAuthenticatedUser();
        if ($authUser) {
            $query->andWhere(['!=', 'school.user_id', $authUser->user_id]);

            $userStudies = UserStudies::find()
                ->select('study_id')
                ->where(['user_id' => $authUser->user_id])
                ->column();

            if (!empty($userStudies)) {
                $query->leftJoin('user_studies us', 'us.user_id = school.user_id AND us.study_id IN (' . implode(',', $userStudies) . ')')
                    ->select(['school.*', 'links.url AS profile_photo_url', 'COUNT(us.study_id) AS common_studies_count'])
                    ->groupBy('school.user_id')
                    ->orderBy(['common_studies_count' => SORT_DESC, 'school.user_id' => SORT_ASC]);
            }
        }

        if ((!empty($levelIds) && is_array($levelIds)) || (!empty($studyIds) && is_array($studyIds))) {
            $query->distinct();
        }

        //pagify handling (after comment)

        $totalCount = $query->count();
        $totalPages = ceil($totalCount / $pageSize);

        $schools = $query->offset(($page - 1) * $pageSize)
            ->limit($pageSize)
            ->asArray()
            ->all();

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'schools' => $schools,
            'pagination' => [
                'total_count' => $totalCount,
                'page_count' => $totalPages,
                'current_page' => $page,
                'page_size' => $pageSize
            ]
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

        if (!empty($data['profile_photo_id'])) {
            if (!is_numeric($data['profile_photo_id'])) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Invalid profile photo ID format'];
            }

            $image = \app\models\Links::findOne($data['profile_photo_id']);
            if (!$image) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Profile photo not found'];
            }
        }

        if (!empty($data['study_ids'])) {
            if (!is_array($data['study_ids'])) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Study IDs must be an array'];
            }

            $studyIds = array_unique($data['study_ids']);
            foreach ($studyIds as $studyId) {
                if (!is_numeric($studyId)) {
                    Yii::$app->response->statusCode = 400;
                    return ['status' => 'error', 'message' => 'Invalid study ID format'];
                }
            }

            $existingStudies = \app\models\Studies::find()
                ->where(['id' => $studyIds])
                ->count();

            if ($existingStudies !== count($studyIds)) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'One or more study IDs do not exist'];
            }
        }

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
            $school->profile_photo_id = $image->id ?? null;
            $school->created_at = date('Y-m-d H:i:s');
            $school->updated_at = date('Y-m-d H:i:s');

            if (!$school->save()) {
                throw new \Exception('Failed to save school: ' . json_encode($school->errors));
            }

            if (!empty($data['level_ids']) && is_array($data['level_ids'])) {
                $levelAssignmentController = new \app\controllers\SchoolLevelAssignmentsController('school-level-assign', Yii::$app);
                $levelAssignmentController->assignLevels($school->user_id, $data['level_ids']);
            }

            if (!empty($studyIds)) {
                $studyAssignmentController = new \app\controllers\UserStudiesController('school-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($school->user_id, $studyIds);
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

        if (isset($data['profile_photo_id'])) {
            if (!is_numeric($data['profile_photo_id'])) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Invalid profile photo ID format'];
            }

            $image = \app\models\Links::findOne($data['profile_photo_id']);
            if (!$image) {
                Yii::$app->response->statusCode = 404;
                return ['status' => 'error', 'message' => 'Profile photo not found'];
            }
            $school->profile_photo_id = $image->id;
        }

        if (isset($data['study_ids'])) {
            if (!is_array($data['study_ids'])) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Study IDs must be an array'];
            }

            $studyIds = array_unique($data['study_ids']);
            foreach ($studyIds as $studyId) {
                if (!is_numeric($studyId)) {
                    Yii::$app->response->statusCode = 400;
                    return ['status' => 'error', 'message' => 'Invalid study ID format'];
                }
            }

            $existingStudies = \app\models\Studies::find()
                ->where(['id' => $studyIds])
                ->count();

            if ($existingStudies !== count($studyIds)) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'One or more study IDs do not exist'];
            }

            $studyAssignmentController = new \app\controllers\UserStudiesController('school-study-assign', Yii::$app);
            $studyAssignmentController->assignStudies($school->user_id, $studyIds);
        }

        $school->attributes = $data;
        $school->updated_at = date('Y-m-d H:i:s');

        if ($school->save()) {
            if (!empty($data['level_ids']) && is_array($data['level_ids'])) {
                $levelAssignmentController = new \app\controllers\SchoolLevelAssignmentsController('school-level-assign', Yii::$app);
                $levelAssignmentController->assignLevels($school->user_id, $data['level_ids']);
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