<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use app\models\Applications;
use yii\web\Response;
use app\controllers\AuthHelper;

class ApplicationsController extends Controller
{
    // Disable CSRF validation for this controller
    public $enableCsrfValidation = false;

    /**
     * Allows a student to apply to a school.
     *
     * @return Response
     */
    public function actionApply($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }
        $data = Yii::$app->request->post();
        $application = new Applications();

        if($authenticatedUser->user_type === 'school') {
            $application->student_id = $id;
            $application->school_id = $authenticatedUser->user_id;
            $application->status = 'invited';
            $application->expiration_date = $data['expiration_date'];
            $application->text_field = $data['text_field'];
        }
        elseif($authenticatedUser->user_type === 'student') {
            $application->school_id = $id;
            $application->student_id = $authenticatedUser->user_id;
            $application->status = 'pending';
            $application->expiration_date = date('Y-m-d H:i:s', strtotime('+1 year'));
        }
        else{
            return[
                'status' => 'error',
                'message' => 'Incorrect user type'
            ];
        }

        if ($application->save()) {
            return [
                'status' => 'success',
                'message' => 'Application submitted successfully.',
                'application_id' => $application->id,
            ];
        }

        return [
            'status' => 'error',
            'message' => 'Failed to submit the application.',
            'errors' => $application->errors,
        ];
    }

     /**
     * Allows a user to fetch their applications.
     *
     * @return Response
     */
    public function actionAll()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        if ($authenticatedUser->user_type === 'student') {
            $applications = Applications::find()->where(['student_id' => $authenticatedUser->user_id])->all();
        } elseif ($authenticatedUser->user_type === 'school') {
            $applications = Applications::find()->where(['school_id' => $authenticatedUser->user_id])->all();
        } else {
            return [
                'status' => 'error',
                'message' => 'Invalid user type.',
            ];
        }

        return [
            'status' => 'success',
            'applications' => $applications,
        ];
    }

    /**
     * Allows a user to view a specific application.
     *
     * @param int $id The ID of the application.
     * @return Response
     */
    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $application = Applications::findOne($id);
        if (!$application) {
            return ['status' => 'error', 'message' => 'Application not found.'];
        }

        if (
            ($authenticatedUser->user_type === 'student' && $application->student_id !== $authenticatedUser->user_id) ||
            ($authenticatedUser->user_type === 'school' && $application->school_id !== $authenticatedUser->user_id)
        ) {
            return ['status' => 'error', 'message' => 'You are not authorized to view this application.'];
        }

        return [
            'status' => 'success',
            'application' => $application,
        ];
    }
}
