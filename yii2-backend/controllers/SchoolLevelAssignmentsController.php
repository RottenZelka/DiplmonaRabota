<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;
use app\models\SchoolLevelAssignments;
use app\models\SchoolLevels;
use app\models\School;


class SchoolLevelAssignmentsController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionAssignLevels()
    {
        $schoolId = Yii::$app->request->post('school_id');
        $levelIds = Yii::$app->request->post('level_ids');

        if (empty($schoolId) || empty($levelIds) || !is_array($levelIds)) {
            throw new BadRequestHttpException('School ID and Level IDs are required.');
        }

        // Verify the school exists
        $user = Yii::$app->user->identity;
        $school = School::findOne(['id' => $schoolId]);

        if (!$school || $school->user_id !== $user->id) {
            throw new UnauthorizedHttpException('You are not authorized to assign levels to this school.');
        }

        // Assign levels to the school
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
                'school_id' => $schoolId,
                'assigned_levels' => $assignedLevels,
            ]
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
