import React, { useState, useEffect, useContext } from 'react';
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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { apply, updateApplicationId, uploadLink } from '../../../services/api';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface CustomJwtPayload extends JwtPayload {
  data: {
    user_id: string;
    email: string;
    user_type: string;
  };
}

const ApplicationApplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [applicationData, setApplicationData] = useState({
    start_date: '',
    expiration_date: '',
    text_field: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [userType, setUserType] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const decodedToken = jwtDecode<CustomJwtPayload>(token!);
        setUserType(decodedToken.data.user_type);
      } catch (error) {
        console.error('Failed to fetch user type:', error);
        setMessage({ type: 'error', text: 'Failed to fetch user type.' });
      }
    };

    fetchUserType();
  }, []);

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
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication token not found. Please log in.' });
        setLoading(false);
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
    if (!file) {
      setMessage({ type: 'error', text: 'No file selected.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await uploadLink(file, 'Application');
      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message });
        return response.link_id;
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload file.' });
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileChange,
    // accept: {
    //   'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    //   'application/pdf': ['.pdf'],
    //   'application/msword': ['.doc'],
    //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    // },
    maxSize: MAX_FILE_SIZE,
  });  

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


      <Grid container spacing={3}>
        {userType === 'school' && (
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
              backgroundColor: isDragActive ? '#f0f0f0' : '#fff',
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
