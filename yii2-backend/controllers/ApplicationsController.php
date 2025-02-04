<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use app\models\Applications;
use yii\web\Response;
use app\helpers\AuthHelper;
use app\models\Period;

class ApplicationsController extends Controller
{
    // Disable CSRF validation for this controller
    public $enableCsrfValidation = false;

    public function actionIsApplied($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        // Retrieve the authenticated user
        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401; 
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        // Determine query conditions based on user type
        $conditions = [];
        if ($authenticatedUser->user_type === 'school') {
            $conditions = ['student_id' => $id, 'school_id' => $authenticatedUser->user_id];
        } elseif ($authenticatedUser->user_type === 'student') {
            $conditions = ['school_id' => $id, 'student_id' => $authenticatedUser->user_id];
        } else {
            Yii::$app->response->statusCode = 400;
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
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'is_applied' => false,
            ];
        }

        Yii::$app->response->statusCode = 200; 
        return [
            'status' => 'success',
            'is_applied' => true,
            'application_id' => $application->id,
        ];
    }

    public function actionApply($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();
        $application = new Applications();

        if ($authenticatedUser->user_type === 'school') {
            $application->student_id = $id;
            $application->school_id = $authenticatedUser->user_id;
            $application->status = 'invited';
            $application->expiration_date = $data['expiration_date'];
            $application->start_date = $data['start_date'];
            $application->text_field = $data['text_field'];

        } elseif ($authenticatedUser->user_type === 'student') {
            $application->school_id = $id;
            $application->student_id = $authenticatedUser->user_id;
            $application->status = 'pending';
            $application->expiration_date = date('Y-m-d H:i:s', strtotime('+1 year'));
            $application->text_field = $data['text_field'];

        } else {
            Yii::$app->response->statusCode = 400;
            return [
                'status' => 'error',
                'message' => 'Incorrect user type',
            ];
        }

        if ($application->save()) {
            Yii::$app->response->statusCode = 201;
            return [
                'status' => 'success',
                'message' => 'Application submitted successfully.',
                'application_id' => $application->id,
            ];
        }

        Yii::$app->response->statusCode = 400;
        return [
            'status' => 'error',
            'message' => 'Failed to submit the application.',
            'errors' => $application->errors,
        ];
    }

    public function actionAll()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401; // Unauthorized
            return ['status' => 'error', 'message' => 'Unauthorized'];
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
            Yii::$app->response->statusCode = 400;
            return [
                'status' => 'error',
                'message' => 'Invalid user type.',
            ];
        }

        if (!empty($statusFilter)) {
            $query->andWhere(['applications.status' => $statusFilter]);
        }

        $applications = $query->asArray()->all();

        Yii::$app->response->statusCode = 200;
        return [
            'status' => 'success',
            'applications' => $applications,
        ];
    }

    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $query = Applications::find()
            ->where(['applications.id' => $id]);

        if ($authenticatedUser->user_type == 'school') {
            $query->leftJoin('student', 'student.user_id = applications.student_id')
                ->leftJoin('user_studies', 'user_studies.user_id = student.user_id')
                ->leftJoin('studies', 'studies.id = user_studies.study_id')
                ->leftJoin('links student_photo', 'student_photo.id = student.profile_photo_id')
                ->leftJoin('links app_files', 'app_files.application_id = applications.id')
                ->leftJoin('period', 'period.school_id = applications.school_id')
                ->leftJoin('exams', 'exams.school_id = applications.school_id')
                ->leftJoin('exam_results', 'exam_results.exam_id = exams.id AND exam_results.student_id = applications.student_id')
                ->select([
                    'applications.*',
                    'student.name as student_name',
                    'student.dob as student_dob',
                    'GROUP_CONCAT(DISTINCT studies.name) as student_studies',
                    'MAX(student_photo.url) as student_photo_url',
                    'GROUP_CONCAT(DISTINCT app_files.url) as application_files',
                    'MAX(period.start_date) as period_start',
                    'MAX(period.end_date) as period_end',
                    'MAX(period.name) as period_name',
                    'GROUP_CONCAT(DISTINCT exams.name) as exam_names',
                    'GROUP_CONCAT(exam_results.score) as exam_scores',
                    'GROUP_CONCAT(exam_results.status) as exam_statuses',
                    'GROUP_CONCAT(exam_results.commentary) as exam_commentaries'
                ])
                ->groupBy('applications.id');
        } elseif ($authenticatedUser->user_type == 'student') {
            $query->leftJoin('school', 'school.user_id = applications.school_id')
                ->leftJoin('school_level_assignments', 'school_level_assignments.school_id = school.user_id')
                ->leftJoin('school_levels', 'school_levels.id = school_level_assignments.level_id')
                ->leftJoin('links school_photo', 'school_photo.id = school.profile_photo_id')
                ->leftJoin('links app_files', 'app_files.application_id = applications.id')
                ->leftJoin('period', 'period.school_id = applications.school_id')
                ->leftJoin('exam_results', 'exam_results.student_id = applications.student_id')
                ->leftJoin('exams', 'exams.id = exam_results.exam_id')
                ->select([
                    'applications.*',
                    'school.name as school_name',
                    'school.address as school_address',
                    'school.description as school_description',
                    'GROUP_CONCAT(DISTINCT school_levels.name) as school_levels',
                    'MAX(school_photo.url) as school_photo_url',
                    'GROUP_CONCAT(DISTINCT app_files.url) as application_files',
                    'MAX(period.start_date) as period_start',
                    'MAX(period.end_date) as period_end',
                    'MAX(period.name) as period_name',
                    'GROUP_CONCAT(DISTINCT exams.name) as exam_names',
                    'GROUP_CONCAT(exam_results.score) as exam_scores',
                    'GROUP_CONCAT(exam_results.status) as exam_statuses',
                    'GROUP_CONCAT(exam_results.commentary) as exam_commentaries'
                ])
                ->groupBy('applications.id');
        }

        $application = $query->asArray()->one();

        if (!$application) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Application not found.'];
        }

        // Authorization check
        if (
            ($authenticatedUser->user_type === 'student' && $application['student_id'] !== $authenticatedUser->user_id) ||
            ($authenticatedUser->user_type === 'school' && $application['school_id'] !== $authenticatedUser->user_id)
        ) {
            Yii::$app->response->statusCode = 403;
            return ['status' => 'error', 'message' => 'You are not authorized to view this application.'];
        }

        // Process grouped fields
        if ($authenticatedUser->user_type == 'school') {
            $application['student_studies'] = array_filter(explode(',', $application['student_studies']));
            $application['application_files'] = array_filter(explode(',', $application['application_files']));
            $application['exams'] = $this->processExamData(
                $application['exam_names'],
                $application['exam_scores'],
                $application['exam_statuses'],
                $application['exam_commentaries']
            );
        } else {
            $application['school_levels'] = array_filter(explode(',', $application['school_levels']));
            $application['application_files'] = array_filter(explode(',', $application['application_files']));
            $application['exams'] = $this->processExamData(
                $application['exam_names'],
                $application['exam_scores'],
                $application['exam_statuses'],
                $application['exam_commentaries']
            );
        }

        return [
            'status' => 'success',
            'application' => $application,
        ];
    }

    private function processExamData($names, $scores, $statuses, $commentaries)
    {
        $exams = [];
        $names = explode(',', $names);
        $scores = explode(',', $scores);
        $statuses = explode(',', $statuses);
        $commentaries = explode(',', $commentaries);

        foreach ($names as $index => $name) {
            if (empty($name)) continue;
            $exams[] = [
                'name' => $name,
                'score' => $scores[$index] ?? null,
                'status' => $statuses[$index] ?? null,
                'commentary' => $commentaries[$index] ?? null,
            ];
        }

        return $exams;
    }

    public function actionHandle($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();
        $application = Applications::findOne($id);

        if (!$application) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Application not found.'];
        }

        // School handling application
        if ($authenticatedUser->user_type == 'school' && $application->school_id === $authenticatedUser->user_id) {
            if (!isset($data['action']) || !in_array($data['action'], ['approved', 'denied']) || !isset($data['start_date'])) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Invalid action.'];
            }

            $application->status = $data['action'] === 'approved' ? 'approved' : 'denied';
            $period = new Period();
            $period->school_id = $authenticatedUser->user_id;
            $period->student_id = $application->student_id;
            $period->start_date = $data['start_date'];
            $period->type = 'student studied from to';
            $end_period = Period::getActiveStudyPeriodByStudent($id);

            if ($end_period != null) {
                $end_period->end_date = $data['start_date'];
            }

            if ($application->save() && $period->save()) {
                Yii::$app->response->statusCode = 200;
                return [
                    'status' => 'success',
                    'message' => "Application {$data['action']}ed successfully.",
                ];
            }

            Yii::$app->response->statusCode = 400;
            return [
                'status' => 'error',
                'message' => 'Failed to update the application status.',
                'errors' => $application->errors,
            ];
        }

        // Student handling invitation
        if ($authenticatedUser->user_type == 'student' && $application->student_id === $authenticatedUser->user_id) {
            if (!isset($data['action']) || !in_array($data['action'], ['approved', 'denied'])) {
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Invalid action.'];
            }

            if ($application->status !== 'invited') {
                Yii::$app->response->statusCode = 400;
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

            if ($end_period != null) {
                $end_period->end_date = $data['start_date'];
            }

            if ($application->save() && $period->save()) {
                Yii::$app->response->statusCode = 200;
                return [
                    'status' => 'success',
                    'message' => "Invitation {$data['action']}ed successfully.",
                ];
            }

            Yii::$app->response->statusCode = 400;
            return [
                'status' => 'error',
                'message' => 'Failed to update the invitation status.',
                'errors' => $application->errors,
            ];
        }

        Yii::$app->response->statusCode = 400;
        return [
            'status' => 'error',
            'message' => 'Invalid request id or user_type',
        ];
    }
}