<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\SchoolLevelAssignments;
use app\models\SchoolLevels;
use app\models\School;
use app\controllers\AuthHelper;

class SchoolLevelAssignmentsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionAssignLevels()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $schoolId = Yii::$app->request->post('school_id');
        $levelIds = Yii::$app->request->post('level_ids');

        if (empty($schoolId) || empty($levelIds) || !is_array($levelIds)) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'School ID and Level IDs are required.'];
        }

        // Verify the school exists and belongs to the authenticated user
        $school = School::findOne(['id' => $schoolId, 'user_id' => $authenticatedUser->id]);
        if (!$school) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'School not found or unauthorized.'];
        }

        // Assign levels to the school
        $assignedLevels = $this->assignLevels($schoolId, $levelIds);

        if (empty($assignedLevels)) {
            Yii::$app->response->statusCode = 500;
            return [
                'status' => 'error',
                'message' => 'No valid level assignments were made.',
            ];
        }

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'message' => 'School levels assigned successfully.',
            'data' => [
                'school_id' => $schoolId,
                'assigned_levels' => $assignedLevels,
            ],
        ];
    }

    public function assignLevels(int $schoolId, array $levelIds): array
    {
        $assignedLevels = [];

        foreach ($levelIds as $levelId) {
            $schoolLevel = SchoolLevels::findOne($levelId);
            if (!$schoolLevel) {
                continue;
            }

            $exists = SchoolLevelAssignments::find()
                ->where(['school_id' => $schoolId, 'level_id' => $levelId])
                ->exists();

            if (!$exists) {
                $assignment = new SchoolLevelAssignments();
                $assignment->school_id = $schoolId;
                $assignment->level_id = $levelId;

                if ($assignment->save()) {
                    $assignedLevels[] = $levelId;
                }
            }
        }
        
        return $assignedLevels;
    }
}