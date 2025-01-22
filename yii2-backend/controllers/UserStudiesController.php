<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\UserStudies;
use app\controllers\AuthHelper;

class UserStudiesController extends Controller
{
    public $enableCsrfValidation = false;

    /**
     * Assign studies to a user.
     */
    public function actionAssignStudies()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // Authenticate the user
        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            // Send a JSON response
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $userId = $authenticatedUser->id;

        // Collect POST data
        $data = Yii::$app->request->post();
        $studyIds = $data['study_ids'] ?? [];

        if (!is_array($studyIds) || empty($studyIds)) {
            return ['status' => 'error', 'message' => 'Invalid study IDs provided.'];
        }

        // Assign studies using the reusable trait
        $assignedStudies = $this->assignStudies($userId, $studyIds);

        return [
            'status' => 'success',
            'message' => 'Studies assigned successfully.',
            'assigned_studies' => $assignedStudies,
        ];
    }

    /**
     * Assign studies to a given user.
     *
     * @param int $userId
     * @param array $studyIds
     * @return array
     */
    public function assignStudies(int $userId, array $studyIds): array
    {
        $assignedStudies = [];

        foreach ($studyIds as $studyId) {
            // Check if assignment already exists
            $exists = UserStudies::find()
                ->where(['user_id' => $userId, 'study_id' => $studyId])
                ->exists();

            if (!$exists) {
                // Create new assignment for the user
                $assignment = new UserStudies();
                $assignment->user_id = $userId;
                $assignment->study_id = $studyId; // Assuming 'study_id' is the field to link with Study model

                if ($assignment->save()) {
                    $assignedStudies[] = $studyId;
                }
            }
        }

        return $assignedStudies;
    }
}
