import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { apply, updateApplicationId, uploadLink } from '../../../services/api';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useAuthContext } from '../../../context/AuthContext';
import TokenManager from '../../../utils/tokenManager';
import { useFileUpload } from '../../../hooks/useFileUpload';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ApplicationApplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const [applicationData, setApplicationData] = useState({
    start_date: '',
    expiration_date: '',
    text_field: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const navigate = useNavigate();

  const { uploadFile, isUploading, error: uploadError, progress } = useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    onSuccess: (linkId) => {
      setMessage({ type: 'success', text: 'File uploaded successfully' });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error });
    }
  });

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const decodedToken = TokenManager.getDecodedToken();
        if (!decodedToken) {
          throw new Error('No valid token found');
        }
      } catch (error) {
        console.error('Failed to fetch user type:', error);
        setMessage({ type: 'error', text: 'Failed to fetch user type. Please log in again.' });
        navigate('/login');
      }
    };

    fetchUserType();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (acceptedFiles: File[]) => {
    setSelectedFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
  };

  const handleRemoveFile = (file: File) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((f) => f !== file)
    );
  };

  const handleSubmitApplication = async () => {
    if (!id) {
      setMessage({ type: 'error', text: 'Application ID is missing.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (!TokenManager.isTokenValid()) {
        setMessage({ type: 'error', text: 'Authentication token not found or invalid. Please log in.' });
        setLoading(false);
        navigate('/login');
        return;
      }

      let linkIds: string[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const linkId = await handleFileUpload(file);
          if (linkId) {
            linkIds.push(linkId);
          } else {
            setMessage({ type: 'error', text: 'File upload failed. Cannot proceed.' });
            setLoading(false);
            return;
          }
        }
      }

      const response = await apply(id, applicationData);
      if (linkIds.length > 0) {
        for (const linkId of linkIds) {
          await updateApplicationId(linkId, response.application_id);
        }
      }

      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message });
        setTimeout(() => navigate('/applications'), 2000); // Redirect after success
      } else {
        throw new Error(response.message || 'Failed to submit application.');
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to submit application.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const linkId = await uploadFile(file, 'Application');
      if (!linkId) {
        throw new Error('Failed to upload file');
      }
      return linkId;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload file' });
      throw error;
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileChange,
    maxSize: MAX_FILE_SIZE,
  });

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Please log in to access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Application Apply Page
      </Typography>

      {message && (
        <Alert
          severity={message.type as 'success' | 'info' | 'warning' | 'error'}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      {isUploading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="center">
            Uploading file... {progress}%
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {user.user_type === 'school' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                name="start_date"
                value={applicationData.start_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Expiration Date"
                type="date"
                name="expiration_date"
                value={applicationData.expiration_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <TextField
            label="Additional Information"
            name="text_field"
            value={applicationData.text_field}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitApplication}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Application'}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            File Upload
          </Typography>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here</p>
            ) : (
              <p>Drag & drop some files here, or click to select files</p>
            )}
          </Box>
          {selectedFiles.length > 0 && (
            <List>
              {selectedFiles.map((file, index) => (
                <ListItem key={index} secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(file)}>
                    <DeleteIcon />
                  </IconButton>
                }>
                  <ListItemText primary={file.name} secondary={`Size: ${(file.size / 1024).toFixed(2)} KB`} />
                </ListItem>
              ))}
            </List>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicationApplyPage;
