<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\UserStudies;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class UserStudiesController extends Controller
{
    use AssignStudiesTrait;

    private $jwtSecret = 'your-secret-key-here'; // Replace with a strong secret key

    public $enableCsrfValidation = false;

    private function validateJwt($token)
    {
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

    /**
     * Assign studies to a user.
     */
    public function actionAssignStudies()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // Authenticate the user
        $authenticatedUser = $this->getAuthenticatedUser();
        if (!$authenticatedUser) {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $userId = $authenticatedUser->id;

        // Collect POST data
        $data = Yii::$app->request->post();
        $studyIds = $data['study_ids'] ?? [];

        if (!is_array($studyIds) || empty($studyIds)) {
            return ['status' => 'error', 'message' => 'Invalid study IDs provided.'];
        }

        // Assign studies using the reusable trait
        $assignedStudies = $this->assignStudies($userId, $studyIds, 'user');

        return [
            'status' => 'success',
            'message' => 'Studies assigned successfully.',
            'assigned_studies' => $assignedStudies,
        ];
    }
}
