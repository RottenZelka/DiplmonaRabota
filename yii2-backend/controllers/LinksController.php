<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\UploadedFile;
use app\models\Links;
use Aws\S3\S3Client;
use yii\web\Response;
use app\helpers\AuthHelper;

class LinksController extends Controller
{
    // Disable CSRF validation for this controller
    public $enableCsrfValidation = false;

    private function initStorage()
    {
        return new S3Client([
            'version' => 'latest',
            'region' => 'us-east-1',
            'endpoint' => 'http://localhost:9000',
            'use_path_style_endpoint' => true,
            'credentials' => [
                'key' => 'minioadmin',
                'secret' => 'minioadmin',
            ],
        ]);
    }

    private function uploadToStorage($link, $uploadedFile, $filePath)
    {
        $s3 = $this->initStorage();
        try {
            $result = $s3->putObject([
                'Bucket' => 'users',
                'Key' => $filePath,
                'SourceFile' => $uploadedFile->tempName,
                'ACL' => 'public-read',
                'ContentType' => $uploadedFile->type,
            ]);
            $link->url = $result['ObjectURL'];
            if ($link->save()) {
                return [
                    'status' => 'success',
                    'message' => ucfirst($link->type) . ' uploaded successfully.',
                    'link_id' => $link->id,
                    'link_url' => $link->url,
                ];
            }
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Failed to save the URL.', 'errors' => $link->errors];
        } catch (\Exception $e) {
            Yii::$app->response->statusCode = 500;
            return ['status' => 'error', 'message' => 'Upload failed.', 'error' => $e->getMessage()];
        }
    }

    public function actionUpload()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }
        $type = Yii::$app->request->get('type');
        $applicationId = Yii::$app->request->get('application_id');
        $questionId = Yii::$app->request->get('question_id');
        $answerId = Yii::$app->request->get('answer_id');

        $uploadedFile = UploadedFile::getInstanceByName('file');
        if (!$uploadedFile || $uploadedFile->error !== UPLOAD_ERR_OK) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'No file uploaded or an error occurred during upload.'];
        }

        switch ($type) {
            case 'Profile Image':
            case 'Album':
                return $this->uploadImage($type, $uploadedFile);
            case 'File':
                return $this->uploadFile($uploadedFile);
            case 'Application':
                return $this->uploadApplicationFile($uploadedFile, $applicationId);
            case 'Profile':
                return $this->uploadProfileFile($uploadedFile);
            case 'Question':
                return $this->uploadQuestionFile($uploadedFile, $questionId);
            case 'Answer':
                return $this->uploadAnswerFile($uploadedFile, $answerId);
            default:
                Yii::$app->response->statusCode = 400;
                return ['status' => 'error', 'message' => 'Invalid type specified.'];
        }
    }

    /*
     * Handles file upload logic.
     *
     * @param UploadedFile $uploadedFile
     * @return array Response data.
     */
    public function uploadFile($uploadedFile)
    {
        $fileName = uniqid() . '.' . $uploadedFile->extension;
        $filePath = 'uploads/' . $fileName;
        $link = new Links();
        $link->type = 'File';
        return $this->uploadToStorage($link, $uploadedFile, $filePath);
    }

    public function uploadImage($type, $uploadedFile)
    {
        $fileName = uniqid() . '.' . $uploadedFile->extension;
        $filePath = match ($type) {
            'Profile Image' => 'profile_photos/' . $fileName,
            'Album' => 'album_photos/' . $fileName,
            default => null,
        };
        if ($filePath === null) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'Invalid image type.'];
        }
        $link = new Links();
        $link->type = $type;
        return $this->uploadToStorage($link, $uploadedFile, $filePath);
    }

    /*
     * Handles application file upload logic.
     *
     * @param UploadedFile $uploadedFile
     * @param int $applicationId
     * @return array Response data.
     */
    public function uploadApplicationFile($uploadedFile, $applicationId = null)
    {
        $fileName = uniqid() . '.' . $uploadedFile->extension;
        $filePath = 'application_files/' . $fileName;
        $link = new Links();
        $link->type = 'Application';
        if ($applicationId) {
            $link->application_id = $applicationId;
        }
        return $this->uploadToStorage($link, $uploadedFile, $filePath);
    }

    /*
     * Handles profile file upload logic.
     *
     * @param UploadedFile $uploadedFile
     * @return array Response data.
     */
    public function uploadProfileFile($uploadedFile)
    {
        $fileName = uniqid() . '.' . $uploadedFile->extension;
        $filePath = 'profile_files/' . $fileName;
        $link = new Links();
        $link->type = 'Profile';
        return $this->uploadToStorage($link, $uploadedFile, $filePath);
    }

    /*
     * Handles question file upload logic.
     *
     * @param UploadedFile $uploadedFile
     * @param int $questionId
     * @return array Response data.
     */
    public function uploadQuestionFile($uploadedFile, $questionId = null)
    {
        $fileName = uniqid() . '.' . $uploadedFile->extension;
        $filePath = 'question_files/' . $fileName;
        $link = new Links();
        $link->type = 'Question';
        if ($questionId) {
            $link->question_id = $questionId;
        }
        return $this->uploadToStorage($link, $uploadedFile, $filePath);
    }

    /*
     * Handles answer file upload logic.
     *
     * @param UploadedFile $uploadedFile
     * @param int $answerId
     * @return array Response data.
     */
    public function uploadAnswerFile($uploadedFile, $answerId = null)
    {
        $fileName = uniqid() . '.' . $uploadedFile->extension;
        $filePath = 'answer_files/' . $fileName;
        $link = new Links();
        $link->type = 'Answer';
        if ($answerId) {
            $link->answer_id = $answerId;
        }
        return $this->uploadToStorage($link, $uploadedFile, $filePath);
    }

    /*
     * Updates the application_id for a link.
     *
     * @param int $linkId
     * @param int $applicationId
     * @return array Response data.
     */
    public function actionUpdateApplicationId()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        $authenticatedUser = AuthHelper::getAuthenticatedUser();
        if (!$authenticatedUser) {
            Yii::$app->response->statusCode = 401;
            return ['status' => 'error', 'message' => 'Unauthorized'];
        }

        $data = Yii::$app->request->post();

        $link_id = $data['linkId'];
        $application_id = $data['applicationId'];

        $link = Links::findOne($link_id);
        if (!$link) {
            Yii::$app->response->statusCode = 404;
            return ['status' => 'error', 'message' => 'Link not found.'];
        }

        $link->application_id = $application_id;
        if ($link->save()) {
            return ['status' => 'success', 'message' => 'Application ID updated successfully.'];
        }

        Yii::$app->response->statusCode = 400;
        return ['status' => 'error', 'message' => 'Failed to update Application ID.', 'errors' => $link->errors];
    }
}
