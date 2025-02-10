<?php

namespace app\controllers;

use Yii;
use yii\rest\Controller;
use yii\web\Response;
use app\models\Student;
use app\helpers\AuthHelper;
use app\models\Links;
use app\controllers\UserStudiesController;
use app\models\UserStudies;

class StudentController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $query = Student::find()
            ->leftJoin('links', 'links.id = student.profile_photo_id')
            ->select(['student.*', 'links.url AS profile_photo_url']);

        // If authenticated user arrange the students in specific way
        $authUser = AuthHelper::getAuthenticatedUser();
        if ($authUser) {
            // Exclude the authenticated user from the list
            $query->andWhere(['!=', 'student.user_id', $authUser->user_id]);
            
            // Get the studies of the authenticated user
            $userStudies = UserStudies::find()
                ->select('study_id')
                ->where(['user_id' => $authUser->user_id])
                ->column();

            if (!empty($userStudies)) {
                // Count matching studies and order by the count
                $query->leftJoin('user_studies us', 'us.user_id = student.user_id AND us.study_id IN (' . implode(',', $userStudies) . ')')
                    ->select(['student.*', 'links.url AS profile_photo_url', 'COUNT(us.study_id) AS common_studies_count'])
                    ->groupBy('student.user_id')
                    ->orderBy(['common_studies_count' => SORT_DESC, 'student.user_id' => SORT_ASC]);
            }
        }

        $students = $query->asArray()->all();

        Yii::$app->response->statusCode = 200;
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
            ->leftJoin(['study_group' => 
                '(SELECT user_id, GROUP_CONCAT(DISTINCT studies.name SEPARATOR ", ") AS study_names 
                 FROM user_studies 
                 JOIN studies ON studies.id = user_studies.study_id 
                 GROUP BY user_id)'
            ], 'study_group.user_id = student.user_id')
            ->leftJoin(['school_group' => 
                '(SELECT student_id, GROUP_CONCAT(DISTINCT school.name SEPARATOR ", ") AS school_names 
                 FROM period 
                 JOIN school ON school.user_id = period.school_id 
                 GROUP BY student_id)'
            ], 'school_group.student_id = student.user_id')
            ->leftJoin(['period_group' => 
                '(SELECT student_id, 
                        GROUP_CONCAT(DISTINCT CONCAT(period.name, " (", 
                            DATE_FORMAT(period.start_date, "%Y-%m-%d"), " to ", 
                            DATE_FORMAT(period.end_date, "%Y-%m-%d"), ")") 
                         SEPARATOR ", ") AS periods 
                 FROM period 
                 GROUP BY student_id)'
            ], 'period_group.student_id = student.user_id')
            ->select([
                'student.*',
                'links.url AS profile_photo_url',
                'study_group.study_names',
                'school_group.school_names',
                'period_group.periods'
            ])
            ->where(['student.user_id' => $id])
            ->asArray()
            ->one();
    
        if ($student) {
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'student' => $student,
            ];
        }
    
        Yii::$app->response->statusCode = 404;
        return ['status' => 'error', 'message' => 'Student not found.'];
    }
    
    public function actionCreate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $data = Yii::$app->request->post();
        $transaction = Yii::$app->db->beginTransaction();

        try {
            $student = new Student();
            $student->user_id = $authenticatedUser->user_id;
            $student->name = $data['name'] ?? null;
            $student->dob = $data['dob'] ?? null;

            // Profile photo handling
            if (!empty($data['profile_photo_id'])) {
                $image = Links::findOne($data['profile_photo_id']);
                if ($image) {
                    $student->profile_photo_id = $image->id;
                } else {
                    Yii::$app->response->statusCode = 400;
                    return ['status' => 'error', 'message' => 'Invalid profile photo ID.'];
                }
            }

            $student->created_at = date('Y-m-d H:i:s');
            $student->updated_at = date('Y-m-d H:i:s');

            if (!$student->save()) {
                throw new \Exception('Failed to save student: ' . json_encode($student->errors));
            }
            
            // Assign Studies using UserStudiesController
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new UserStudiesController('student-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($student->user_id, $data['study_ids']);
            }

            $transaction->commit();
            Yii::$app->response->statusCode = 200;
            return [
                'status' => 'success',
                'message' => 'Student created successfully.',
                'student' => $student,
            ];
        } catch (\Exception $e) {
            $transaction->rollBack();
            Yii::$app->response->statusCode = 500;
            return [
                'status' => 'error',
                'message' => 'Failed to create student: ' . $e->getMessage(),
            ];
        }
    }

    public function actionUpdate()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser || $authenticatedUser->user_type !== 'student') {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized.'];
        }

        $student = Student::findOne($authenticatedUser->user_id);
        if (!$student) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Student not found.'];
        }

        $data = Yii::$app->request->post();
        $student->attributes = $data;
        $student->updated_at = date('Y-m-d H:i:s');

        if ($student->save()) {
            if (!empty($data['study_ids']) && is_array($data['study_ids'])) {
                $studyAssignmentController = new UserStudiesController('student-study-assign', Yii::$app);
                $studyAssignmentController->assignStudies($student->user_id, $data['study_ids']);
            }

            Yii::$app->response->statusCode = 200;
            return ['status' => 'success', 'student' => $student];
        }

        Yii::$app->response->statusCode = 500;
        return ['status' => 'error', 'errors' => $student->errors];
    }

}