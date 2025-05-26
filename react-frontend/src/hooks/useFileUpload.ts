import { useState } from 'react';
import { validateFile } from '../utils/validation';
import { uploadLink } from '../services/api';

interface UseFileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  onSuccess?: (linkId: string, file: File) => void;
  onError?: (error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, type: string = 'File') => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file
      const validationResult = validateFile(file);

      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadLink(file, type);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (response.status === 'success') {
        options.onSuccess?.(response.link_id, file);
        return response.link_id;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      options.onError?.(err.message || 'Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    error,
    progress,
    reset: () => {
      setError(null);
      setProgress(0);
    }
  };
}; 