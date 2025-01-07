<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\UploadedFile;
use app\models\Links;
use Aws\S3\S3Client;

class LinksController extends Controller
{
    // Disable CSRF validation for this controller
    public $enableCsrfValidation = false;

    /**
     * Initialize the S3 or MinIO client.
     *
     * @return S3Client
     */
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

    /**
     * Upload a file to S3/MinIO storage.
     *
     * @param Links $link The link model instance to save.
     * @param UploadedFile $uploadedFile The uploaded file instance.
     * @param string $filePath The file path in the storage.
     * @param string $bucketName The S3 bucket name.
     * @return array Response data.
     */
    private function uploadToStorage($link, $uploadedFile, $filePath, )
    {
        $s3 = $this->initStorage();

        try {
            // Upload to storage
            $result = $s3->putObject([
                'Bucket' => 'users',
                'Key' => $filePath,
                'SourceFile' => $uploadedFile->tempName,
                'ACL' => 'public-read',
                'ContentType' => $uploadedFile->type,
            ]);

            // Save URL to the database
            $link->url = $result['ObjectURL'];
            if ($link->save()) {
                return [
                    'status' => 'success',
                    'message' => ucfirst($link->type) . ' uploaded successfully.',
                    'link_id' => $link->id,
                    'link_url' => $link->url,
                ];
            }

            return ['status' => 'error', 'message' => 'Failed to save the URL.', 'errors' => $link->errors];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Upload failed.', 'error' => $e->getMessage()];
        }
    }

    /**
     * Handles file upload logic.
     *
     * @return array Response data.
     */
    public function uploadFile()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;

        // Retrieve uploaded file
        $uploadedFile = UploadedFile::getInstanceByName('file');
        if (!$uploadedFile || $uploadedFile->error !== UPLOAD_ERR_OK) {
            return ['status' => 'error', 'message' => 'No file uploaded or an error occurred during upload.'];
        }

        $fileName = uniqid() . '.' . $uploadedFile->extension;
        $filePath = 'uploads/' . $fileName;

        // Save URL to the database
        $link = new Links();
        $link->type = 'File';

        return $this->uploadToStorage($link, $uploadedFile, $filePath);
    }

    /**
     * Handles image upload logic.
     *
     * @param string $type The type of the image (Profile Image, Post Image, Album).
     * @return array Response data.
     */
    public function uploadImage($type)
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;

        // Retrieve uploaded file
        $uploadedFile = UploadedFile::getInstanceByName('image');
        if (!$uploadedFile || $uploadedFile->error !== UPLOAD_ERR_OK) {
            return ['status' => 'error', 'message' => 'No image uploaded or an error occurred during upload.'];
        }

        $fileName = uniqid() . '.' . $uploadedFile->extension;
        $filePath = match ($type) {
            'Profile Image' => 'profile_photos/' . $fileName,
            'Post Image' => 'post_photos/' . $fileName,
            'Album' => 'album_photos/' . $fileName,
            default => null,
        };

        if ($filePath === null) {
            return ['status' => 'error', 'message' => 'Invalid image type.'];
        }

        // Save URL to the database
        $link = new Links();
        $link->type = $type;

        return $this->uploadToStorage($link, $uploadedFile, $filePath);
    }

    /**
     * Uploads or saves links based on the provided type and URL.
     *
     * @param string $type The type of the link (Address, Profile Image, Post Image, Album, File).
     * @param string|null $url Optional URL for types like Address.
     * @return array Response data.
     */
    public function actionUpload()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;

        $type = Yii::$app->request->get('type');
        $url = Yii::$app->request->get('url');

        if ($type === 'Address') {
            $link = new Links();
            $link->type = $type;
            $link->url = $url;

            if ($link->save()) {
                return [
                    'status' => 'success',
                    'message' => 'Address saved successfully.',
                    'link_id' => $link->id,
                ];
            }

            return ['status' => 'error', 'message' => 'Failed to save address.', 'errors' => $link->errors];
        } elseif (in_array($type, ['Profile Image', 'Post Image', 'Album'])) {
            return $this->uploadImage($type);
        } elseif ($type === 'File') {
            return $this->uploadFile();
        }

        return ['status' => 'error', 'message' => 'Invalid type specified.'];
    }
}
