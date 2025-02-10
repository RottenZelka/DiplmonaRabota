import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Alert, CircularProgress, Button, Stack, Card, CardContent, Chip } from '@mui/material';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { getApplicationById } from '../../../services/api';

interface CustomJwtPayload extends JwtPayload {
  data: {
    user_id: string;
    email: string;
    user_type: string;
  };
}

interface Application {
  id: string;
  school_name: string;
  school_address: string;
  school_description: string;
  school_levels: string[];
  school_photo_url: string;
  student_name: string;
  student_dob: string;
  student_studies: string[];
  student_photo_url: string;
  application_files: string[];
  exams: {
    name: string;
    score: string;
    status: string;
    commentary: string;
  }[];
  status: string;
  created_at: string;
  text_field: string;
  period_name: string;
  period_start: string;
  period_end: string;
}

const ApplicationView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [viewType, setViewType] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError(true);
        setViewType('Unauthorized');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        let currentUserId: string | null = null;
        let currentUserType: string | null = null;

        if (token) {
          const decodedToken = jwtDecode<CustomJwtPayload>(token);
          currentUserId = decodedToken.data.user_id;
          currentUserType = decodedToken.data.user_type;
          setIsAuthenticated(true);
        }

        const applicationDetails = await getApplicationById(id);

        if (applicationDetails.status === 'error') {
          throw new Error(applicationDetails.message);
        }

        const applicationData = applicationDetails.application;
        if (!applicationData) {
          throw new Error('Application data not found');
        }

        if (currentUserId) {
          if (applicationData.student_id === currentUserId) {
            setViewType('StudentViewingApplication');
          } else if (applicationData.school_id === currentUserId) {
            setViewType('SchoolViewingApplication');
          } else {
            setViewType('Unauthorized');
          }
        } else {
          setViewType('Unauthorized');
        }

        setApplication(applicationData);
      } catch (error) {
        console.error('Error fetching application details:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const renderDetailsSection = (title: string, content: React.ReactNode) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {title}
      </Typography>
      {content}
    </Box>
  );

  const renderFileList = (files: string[]) => (
    <Stack spacing={1}>
      {files?.map((file, index) => (
        <Button
          key={index}
          href={file}
          target="_blank"
          variant="outlined"
          sx={{ justifyContent: 'flex-start' }}
        >
          📄 File {index + 1}
        </Button>
      ))}
    </Stack>
  );

  const renderStudentView = () => {
    const {
      school_name,
      school_address,
      school_description,
      school_levels,
      school_photo_url,
      application_files,
      exams,
    } = application!;

    return (
      <Card sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          {school_photo_url && (
            <img
              src={school_photo_url}
              alt="School Profile"
              style={{ width: 100, height: 100, borderRadius: '50%', marginRight: 16 }}
            />
          )}
          <div>
            <Typography variant="h4">{school_name}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {school_address}
            </Typography>
          </div>
        </Box>

        {renderDetailsSection('School Description', (
          <Typography variant="body1">{school_description}</Typography>
        ))}

        {renderDetailsSection('School Levels', (
          <div>
            {school_levels?.map((level, index) => (
              <Chip key={index} label={level} sx={{ m: 0.5 }} />
            ))}
          </div>
        ))}

        {renderDetailsSection('Application Details', (
          <div>
            <Typography>Status: <strong>{application!.status}</strong></Typography>
            <Typography>
              Applied on: {new Date(application!.created_at).toLocaleDateString()}
            </Typography>
            {application!.text_field && (
              <Box mt={2}>
                <Typography variant="subtitle2">Application Message:</Typography>
                <Typography variant="body1">{application!.text_field}</Typography>
              </Box>
            )}
          </div>
        ))}

        {renderDetailsSection('Attached Files',
          application_files.length > 0 ? renderFileList(application_files) : 'No files attached'
        )}

        {renderDetailsSection('School Periods', (
          <div>
            <Typography>{application!.period_name} Period</Typography>
            <Typography>
              {new Date(application!.period_start).toLocaleDateString()} -
              {new Date(application!.period_end).toLocaleDateString()}
            </Typography>
          </div>
        ))}

        {renderDetailsSection('Exam Results',
          exams.length > 0 ? exams.map((exam, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle1">{exam.name}</Typography>
              <Typography>Score: {exam.score || 'N/A'}</Typography>
              <Typography>Status: {exam.status || 'Pending'}</Typography>
              {exam.commentary && (
                <Typography>Feedback: {exam.commentary}</Typography>
              )}
            </Box>
          )) : 'No exams completed yet'
        )}
      </Card>
    );
  };

  const renderSchoolView = () => {
    const {
      student_name,
      student_dob,
      student_studies,
      student_photo_url,
      application_files,
      exams,
    } = application!;

    const age = Math.floor((new Date().getTime() - new Date(student_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    return (
      <Card sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          {student_photo_url && (
            <img
              src={student_photo_url}
              alt="Student Profile"
              style={{ width: 100, height: 100, borderRadius: '50%', marginRight: 16 }}
            />
          )}
          <div>
            <Typography variant="h4">{student_name}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Age: {age} years
            </Typography>
          </div>
        </Box>

        {renderDetailsSection('Studies', (
          <div>
            {student_studies?.map((study, index) => (
              <Chip key={index} label={study} sx={{ m: 0.5 }} />
            ))}
          </div>
        ))}

        {renderDetailsSection('Application Details', (
          <div>
            <Typography>Status: <strong>{application!.status}</strong></Typography>
            <Typography>
              Applied on: {new Date(application!.created_at).toLocaleDateString()}
            </Typography>
            {application!.text_field && (
              <Box mt={2}>
                <Typography variant="subtitle2">Application Message:</Typography>
                <Typography variant="body1">{application!.text_field}</Typography>
              </Box>
            )}
          </div>
        ))}

        {renderDetailsSection('Attached Files',
          application_files.length > 0 ? renderFileList(application_files) : 'No files attached'
        )}

        {renderDetailsSection('School Periods', (
          <div>
            <Typography>{application!.period_name} Period</Typography>
            <Typography>
              {new Date(application!.period_start).toLocaleDateString()} -
              {new Date(application!.period_end).toLocaleDateString()}
            </Typography>
          </div>
        ))}

        {renderDetailsSection('Exam Results',
          exams.length > 0 ? exams.map((exam, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle1">{exam.name}</Typography>
              <Typography>Score: {exam.score || 'N/A'}</Typography>
              <Typography>Status: {exam.status || 'Pending'}</Typography>
              {exam.commentary && (
                <Typography>Feedback: {exam.commentary}</Typography>
              )}
            </Box>
          )) : 'No exams completed yet'
        )}
      </Card>
    );
  };

  const renderView = () => {
    if (!application) return null;

    switch (viewType) {
      case 'StudentViewingApplication':
        return renderStudentView();
      case 'SchoolViewingApplication':
        return renderSchoolView();
      default:
        return (
          <Typography variant="h6" color="textSecondary">
            You are not authorized to view this application.
          </Typography>
        );
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{ minHeight: '100vh', px: 3, py: 4 }}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
          <CircularProgress color="primary" />
          <Typography variant="body1" mt={2}>
            Loading application data...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ maxWidth: 600, width: '100%', mb: 2 }}>
          Unable to load application data. Please try again later.
        </Alert>
      ) : (
        <Box sx={{ maxWidth: 800, width: '100%', backgroundColor: '#fff', borderRadius: 2, p: 3, boxShadow: 1 }}>
          {renderView()}
        </Box>
      )}
    </Box>
  );
};

export default ApplicationView;
