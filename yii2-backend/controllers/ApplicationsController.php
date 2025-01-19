<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use app\models\Applications;
use yii\web\Response;
use app\controllers\AuthHelper;
use app\models\Period;
use Codeception\Application;

class ApplicationsController extends Controller
{
    // Disable CSRF validation for this controller
    public $enableCsrfValidation = false;

    public function actionIsApplied($id) {
        Yii::$app->response->format = Response::FORMAT_JSON;
    
        // Retrieve the authenticated user
        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }
    
        // Determine query conditions based on user type
        $conditions = [];
        if ($authenticatedUser->user_type === 'school') {
            $conditions = ['student_id' => $id, 'school_id' => $authenticatedUser->user_id];
        } elseif ($authenticatedUser->user_type === 'student') {
            $conditions = ['school_id' => $id, 'student_id' => $authenticatedUser->user_id];
        } else {
            return [
                'status' => 'error',
                'message' => 'Incorrect user type.',
            ];
        }
    
        // Fetch the application from the database
        $application = Applications::find()
            ->where($conditions)
            ->one();
    
        // Return the application status
        if ($application === null) {
            return [
                'status' => 'success',
                'is_applied' => false,
            ];
        }
    
        return [
            'status' => 'success',
            'is_applied' => true,
            'application_id' => $application->id,
        ];
    }    
    
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
            $application->start_date = $data['start_date'];
            $application->text_field = $data['text_field'];

            if (!empty($data['file_field'])) {
                $file = \app\models\Links::findOne($data['file_field']);
                if ($file) {
                    $application->file_field = $file->id;
                } else {
                    throw new \Exception('Invalid profile photo ID.');
                }
            }
        }
        elseif($authenticatedUser->user_type === 'student') {
            $application->school_id = $id;
            $application->student_id = $authenticatedUser->user_id;
            $application->status = 'pending';
            $application->expiration_date = date('Y-m-d H:i:s', strtotime('+1 year'));
            $application->text_field = $data['text_field'];

            if (!empty($data['file_field'])) {
                $file = \app\models\Links::findOne($data['file_field']);
                if ($file) {
                    $application->file_field = $file->id;
                } else {
                    throw new \Exception('Invalid profile photo ID.');
                }
            }
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
    
        $request = Yii::$app->request;
        $schoolFilter = $request->get('school_filter', ''); // Filter by school name (if student)
        $statusFilter = $request->get('status_filter', ''); // Filter by status
    
        $query = Applications::find();
    
        if ($authenticatedUser->user_type === 'student') {
            $query->leftJoin('school', 'school.user_id = applications.school_id')
                ->select([
                    'applications.*', 
                    'school.name AS school_name',
                ])
                ->where(['applications.student_id' => $authenticatedUser->user_id]);
    
            if (!empty($schoolFilter)) {
                $query->andFilterWhere(['like', 'school.name', $schoolFilter]);
            }
        } elseif ($authenticatedUser->user_type === 'school') {
            $query->leftJoin('student', 'student.user_id = applications.student_id')
                ->select([
                    'applications.*', 
                    'student.name AS student_name',
                ])
                ->where(['applications.school_id' => $authenticatedUser->user_id]);
    
            if (!empty($schoolFilter)) {
                $query->andFilterWhere(['like', 'student.name', $schoolFilter]);
            }
        } else {
            return [
                'status' => 'error',
                'message' => 'Invalid user type.',
            ];
        }
    
        if (!empty($statusFilter)) {
            $query->andWhere(['applications.status' => $statusFilter]);
        }
    
        $applications = $query->asArray()->all();
    
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
        
        if($authenticatedUser->user_type == 'school')
        {
            $application = Applications::find()
                ->leftJoin('period', 'period.school_id = applications.school_id')
                ->leftJoin('student', 'student.user_id = applications.student_id')
                ->select([
                    'applications.*', 
                    'period.start_date AS start_date_period', 
                    'student.name AS candidate_name',
                ])
                ->where(['applications.id' => $id])
                ->asArray()
                ->one();
        }
        elseif($authenticatedUser->user_type == 'student') {
            $application = Applications::find()
                ->leftJoin('period', 'period.school_id = applications.school_id')
                ->leftJoin('school', 'school.user_id = applications.school_id')
                ->select([
                    'applications.*', 
                    'period.start_date AS start_date_period', 
                    'school.name AS candidate_name',
                ])
                ->where(['applications.id' => $id])
                ->asArray()
                ->one();
        }
    
        if (!$application) {
            return ['status' => 'error', 'message' => 'Application not found.'];
        }
    
        if (
            ($authenticatedUser->user_type === 'student' && $application['student_id'] !== $authenticatedUser->user_id) ||
            ($authenticatedUser->user_type === 'school' && $application['school_id'] !== $authenticatedUser->user_id)
        ) {
            return ['status' => 'error', 'message' => 'You are not authorized to view this application.'];
        }
    
        return [
            'status' => 'success',
            'application' => $application,
        ];
    }
    

    /**
     * Handles an application (for schools to accept/reject and for students to accept/reject invitations).
     *
     * @return Response
     */
    public function actionHandle($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $data = Yii::$app->request->post();
        $application = Applications::findOne($id);

        if (!$application) {
            return ['status' => 'error', 'message' => 'Application not found.'];
        }

        // School handling application
        if ($authenticatedUser->user_type == 'school' && $application->school_id === $authenticatedUser->user_id) {
            if (!isset($data['action']) || !in_array($data['action'], ['approved', 'denied']) || !isset($data['start_date'])) {
                return ['status' => 'error', 'message' => 'Invalid action.'];
            }

            $application->status = $data['action'] === 'approved' ? 'approved' : 'denied';
            // $application->start_date = $data['start_date'];
            $period = new Period();
            $period->school_id = $authenticatedUser->user_id;
            $period->student_id = $application->student_id;
            $period->start_date = $data['start_date'];
            $period->type = 'student studied from to';
            $end_period = Period::getActiveStudyPeriodByStudent($id);

            if($end_period != null) {
                $end_period->end_date = $data['start_date'];
            }

            if ($application->save() && $period->save()) {
                return [
                    'status' => 'success',
                    'message' => "Application {$data['action']}ed successfully.",
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to update the application status.',
                'errors' => $application->errors,
            ];
        }

        // Student handling invitation
        if ($authenticatedUser->user_type == 'student' && $application->student_id === $authenticatedUser->user_id) {
            if (!isset($data['action']) || !in_array($data['action'], ['approved', 'denied'])) {
                return ['status' => 'error', 'message' => 'Invalid action.'];
            }

            if ($application->status !== 'invited') {
                return [
                    'status' => 'error',
                    'message' => 'You can only respond to invitations.',
                ];
            }

            $application->status = $data['action'] === 'approved' ? 'approved' : 'denied';
            $period = new Period();
            $period->school_id = $authenticatedUser->user_id;
            $period->student_id = $application->student_id;
            $period->start_date = $data['start_date'];
            $period->type = 'student studied from to';
            $end_period = Period::getActiveStudyPeriodByStudent($id);

            if($end_period != null) {
                $end_period->end_date = $data['start_date'];
            }

            if ($application->save() && $period->save()) {
                return [
                    'status' => 'success',
                    'message' => "Invitation {$data['action']}ed successfully.",
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to update the invitation status.',
                'errors' => $application->errors,
            ];
        }

        return [
            'status' => 'error',
            'message' => 'Unauthorized action.',
        ];
    }

}
