<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\UserStudies;
use app\helpers\AuthHelper;

class UserStudiesController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionAssignStudies()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $data = Yii::$app->request->post();
        $studyIds = $data['study_ids'] ?? [];

        if (!is_array($studyIds) || empty($studyIds)) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Invalid study IDs provided.'];
        }

        $assignedStudies = $this->assignStudies($authenticatedUser->id, $studyIds);

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'message' => 'Studies assigned successfully.',
            'assigned_studies' => $assignedStudies,
        ];
    }

    public function assignStudies(int $userId, array $studyIds): array
    {
        $assignedStudies = [];

        foreach ($studyIds as $studyId) {
            $exists = UserStudies::find()
                ->where(['user_id' => $userId, 'study_id' => $studyId])
                ->exists();

            if (!$exists) {
                $assignment = new UserStudies();
                $assignment->user_id = $userId;
                $assignment->study_id = $studyId;

                if ($assignment->save()) {
                    $assignedStudies[] = $studyId;
                }
            }
        }

        return $assignedStudies;
    }
}