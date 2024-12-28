<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;
use app\models\SchoolLevelAssignments;
use app\models\SchoolLevels;
use app\models\School;
use app\controllers\AssignStudiesTrait;

class SchoolLevelAssignmentsController extends Controller
{
    use AssignStudiesTrait;

    public $enableCsrfValidation = false;

    /**
     * Assign levels to a school.
     *
     * @param int $schoolId
     * @param array $levelIds
     * @return array
     */
    public function actionAssignLevels()
    {
        $schoolId = Yii::$app->request->post('user_id');
        $levelIds = Yii::$app->request->post('level_ids');

        // Validate input
        if (empty($schoolId) || empty($levelIds) || !is_array($levelIds)) {
            throw new BadRequestHttpException('School ID and Level IDs are required.');
        }

        // Verify that the authenticated user owns the school
        $user = Yii::$app->user->identity;
        $school = School::findOne($schoolId);

        if (!$school || $school->user_id !== $user->id) {
            throw new UnauthorizedHttpException('You are not authorized to assign levels to this school.');
        }

        // Process the level assignments
        $assignedLevels = $this->assignLevels($schoolId, $levelIds);

        if (empty($assignedLevels)) {
            return [
                'status' => 'error',
                'message' => 'No valid level assignments were made.',
            ];
        }

        return [
            'status' => 'success',
            'message' => 'School levels assigned successfully.',
            'data' => [
                'user_id' => $schoolId,
                'assigned_levels' => $assignedLevels,
            ]
        ];
    }

    /**
     * Assign levels to the given school.
     *
     * @param int $schoolId
     * @param array $levelIds
     * @return array
     */
    public function assignLevels(int $schoolId, array $levelIds): array
    {
        $assignedLevels = [];

        foreach ($levelIds as $levelId) {
            // Check if level exists
            $schoolLevel = SchoolLevels::findOne($levelId);
            if (!$schoolLevel) {
                continue; // Skip invalid level IDs
            }

            // Check if the level is already assigned to the school
            $exists = SchoolLevelAssignments::find()
                ->where(['user_id' => $schoolId, 'level_id' => $levelId])
                ->exists();

            if (!$exists) {
                // Create a new assignment
                $assignment = new SchoolLevelAssignments();
                $assignment->user_id = $schoolId;
                $assignment->level_id = $levelId;

                if ($assignment->save()) {
                    $assignedLevels[] = $levelId;
                }
            }
        }

        return $assignedLevels;
    }
}
