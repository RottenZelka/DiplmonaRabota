<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\UploadedFile;
use app\models\Images;
use Aws\S3\S3Client;

class ImagesController extends Controller
{
    // Disable CSRF validation for this controller
    public $enableCsrfValidation = false;

    /**
     * Upload an image to MinIO or S3 storage and save its URL in the database.
     *
     * @return array
     */
    public function actionUploadImage()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;

        // Retrieve uploaded file
        $uploadedFile = UploadedFile::getInstanceByName('image');
        if (!$uploadedFile || $uploadedFile->error !== UPLOAD_ERR_OK) {
            return ['status' => 'error', 'message' => 'No image uploaded or an error occurred during upload.'];
        }

        $fileName = uniqid() . '.' . $uploadedFile->extension; // Unique file name
        $bucketName = 'users';
        $filePath = 'profile_photos/' . $fileName;

        $s3 = new S3Client([
            'version' => 'latest',
            'region' => 'us-east-1',
            'endpoint' => 'http://localhost:9000',
            'use_path_style_endpoint' => true,
            'credentials' => [
                'key' => 'minioadmin',
                'secret' => 'minioadmin',
            ],
        ]);

        try {
            // Upload to storage
            $result = $s3->putObject([
                'Bucket' => $bucketName,
                'Key' => $filePath,
                'SourceFile' => $uploadedFile->tempName,
                'ACL' => 'public-read',
            ]);

            // Save URL to the images table
            $image = new Images();
            $image->url = $result['ObjectURL']; // URL of the uploaded file
            if ($image->save()) {
                return [
                    'status' => 'success',
                    'message' => 'Image uploaded successfully.',
                    'image_id' => $image->id,
                    'image_url' => $image->url,
                ];
            }

            return ['status' => 'error', 'message' => 'Failed to save image URL.', 'errors' => $image->errors];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Image upload failed.', 'error' => $e->getMessage()];
        }
    }
}
