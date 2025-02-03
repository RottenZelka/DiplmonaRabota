<?php
namespace app\controllers;
use Yii;
use yii\web\Controller;
use yii\web\UploadedFile;
use app\models\Links;
use Aws\S3\S3Client;
use yii\web\Response;
use app\controllers\AuthHelper;
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
        
        $uploadedFile = UploadedFile::getInstanceByName('file');
        if (!$uploadedFile || $uploadedFile->error !== UPLOAD_ERR_OK) {
            Yii::$app->response->statusCode = 400;
            return ['status' => 'error', 'message' => 'No file uploaded or an error occurred during upload.'];
        }
        switch ($type) {
            case 'Address':
                $url = Yii::$app->request->get('url');
                // Address logic here if needed
                break;
            case 'Profile Image':
                return $this->uploadImage($type, $uploadedFile);
            case 'Album':
                return $this->uploadImage($type, $uploadedFile);
            case 'File':
                return $this->uploadFile($uploadedFile); // Pass file directly to handle upload
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
    
    /*
     * Handles image upload logic. (updated to receive the image file directly)
     *
     * @param string $type The type of the image (Profile Image, Post Image, Album).
     * @param UploadedFile $uploadedFile
     * @return array Response data.
     */
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
}
