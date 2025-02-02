<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Student;
use app\controllers\AuthHelper;

class StudentController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $students = Student::find()
            ->leftJoin('links', 'links.id = student.profile_photo_id')
            ->select(['student.*', 'links.url AS profile_photo_url'])
            ->asArray()
            ->all();

        return [
            'status' => 'success',
            'students' => $students,
        ];
    }

    public function actionView($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $student = Student::find()
            ->leftJoin('links', 'links.id = student.profile_photo_id')
            ->leftJoin('user_studies', 'user_studies.user_id = student.user_id')
            ->leftJoin('studies', 'studies.id = user_studies.study_id')
            ->leftJoin('period', 'period.student_id = student.user_id')
            ->leftJoin('school', 'school.user_id = period.school_id') // Adjust based on the school-period relationship
            ->select([
                'student.*',
                'links.url AS profile_photo_url',
                'GROUP_CONCAT(studies.name) AS study_names',
                'GROUP_CONCAT(DISTINCT school.name) AS school_names',
                'GROUP_CONCAT(DISTINCT CONCAT(period.name, " (", period.start_date, " to ", period.end_date, ")")) AS periods'
            ])
            ->where(['student.user_id' => $id])
            ->groupBy('student.user_id')
            ->asArray()
            ->one();



        if ($student) {
            return [
                'status' => 'success',
                'student' => $student,
            ];
        }

        return ['status' => 'error', 'message' => 'Student not found.'];
    }

    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $data = Yii::$app->request->post();
        $transaction = Yii::$app->db->beginTransaction(); // Start transaction

        try {
            $student = new Student();
            $student->user_id = $authenticatedUser->user_id; // Automatically set user_id from token
            $student->name = $data['name'] ?? null;
            $student->dob = $data['dob'] ?? null;

            // Handle profile photo
            if (!empty($data['profile_photo_id'])) {
                $image = \app\models\Links::findOne($data['profile_photo_id']);
                if ($image) {
                    $student->profile_photo_id = $image->id;
                } else {
                    return ['status' => 'error', 'message' => 'Invalid profile photo ID.'];
                }
            }

            $student->created_at = date('Y-m-d H:i:s');
            $student->updated_at = date('Y-m-d H:i:s');

            if (!$student->save()) {
                throw new \Exception('Failed to save student: ' . json_encode($student->errors));
            }
            
            // Handle assignment of studies using the AssignStudiesTrait method
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new \app\controllers\UserStudiesController('student-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($student->user_id, $data['study_ids']);
            }
    
            $transaction->commit(); // Commit transaction if everything is successful

            if ($student->save()) {
                return [
                    'status' => 'success',
                    'message' => 'Student created successfully.',
                    'student' => $student,
                ];
            }
        } catch (\Exception $e) {
            $transaction->rollBack(); // Rollback transaction if an error occurs
            return [
                'status' => 'error',
                'message' => 'Failed to create student: ' . $e->getMessage(),
            ];
        }
    }

    public function actionUpdate($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $student = Student::findOne($id);
        if (!$student) {
            return ['status' => 'error', 'message' => 'Student not found.'];
        }

        $data = Yii::$app->request->post();
        $student->attributes = $data;
        $student->updated_at = date('Y-m-d H:i:s');

        if ($student->save()) {
            // Handle assignment of studies using the AssignStudiesTrait method
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyIds = $data['study_ids'];

                // Assign studies to the school using the assignStudies method from the trait
                $assignedStudies = $this->assignStudies($student->user_id, $studyIds);
            } else {
                $assignedStudies = [];
            }

            return ['status' => 'success', 'student' => $student];
        }

        return ['status' => 'error', 'errors' => $student->errors];
    }

    public function actionDelete($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $student = Student::findOne($id);
        if (!$student) {
            return ['status' => 'error', 'message' => 'Student not found.'];
        }

        if ($student->delete()) {
            return ['status' => 'success', 'message' => 'Student deleted successfully.'];
        }

        return ['status' => 'error', 'message' => 'Failed to delete student.'];
    }
}
