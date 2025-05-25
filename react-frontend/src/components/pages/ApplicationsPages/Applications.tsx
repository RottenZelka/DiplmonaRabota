import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getApplications, handleApplication } from '../../../services/api';
import TokenManager from '../../../utils/tokenManager';

interface Application {
  id: string;
  student_id: string;
  school_id: string;
  school_name: string;
  status: string;
  created_at: string;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [userType, setUserType] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<string>('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const decodedToken = TokenManager.getDecodedToken();
        if (!decodedToken) {
          setError('Please log in to view applications.');
          return;
        }

        setUserType(decodedToken.data.user_type);
        setUserId(decodedToken.data.user_id);
      } catch (error) {
        console.error('Failed to fetch user type:', error);
        setError('Please log in to view applications.');
      }
    };

    fetchUserType();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await getApplications();
        const apps = response.applications || [];
        setApplications(apps);
        setFilteredApplications(apps); // Initialize filtered applications
      } catch (err) {
        setError('Failed to load applications. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    // Filter applications based on school name and status
    let filtered = [...applications];

    if (schoolFilter) {
      filtered = filtered.filter((app) =>
        app.school_name.toLowerCase().includes(schoolFilter.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, schoolFilter, statusFilter]);

  const handleApprove = (id: string) => {
    setSelectedApplicationId(id);
    setDialogAction('approve');
    setOpenDialog(true);
  };

  const handleReject = (id: string) => {
    setSelectedApplicationId(id);
    setDialogAction('reject');
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedApplicationId) return;

    try {
      const response = await handleApplication(selectedApplicationId, {
        action: dialogAction,
        start_date: startDate
      });
      if (response.status === 'success') {
        // Update the application status in the local state
        setApplications((prevApps) =>
          prevApps.map((app) =>
            app.id === selectedApplicationId
              ? { ...app, status: dialogAction === 'approve' ? 'approved' : 'denied' }
              : app
          )
        );
        setMessage({
          type: 'success',
          text: `Application ${dialogAction === 'approve' ? 'approved' : 'rejected'} successfully.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to process application.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'An error occurred while processing the application.',
      });
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setStartDate('');
    setSelectedApplicationId(null);
    setDialogAction('');
  };

  const renderApplicationsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Application ID</TableCell>
            <TableCell>School/Student</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredApplications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.id}</TableCell>
              <TableCell>
                {userType === 'school'
                  ? `Student ID: ${app.student_id}`
                  : `School name: ${app.school_name}`}
              </TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/application/${app.id}`)}
                  sx={{ mr: 1 }}
                >
                  View Details
                </Button>
                {(app.status === 'pending' && userType === 'school') ||
                  (app.status === 'invited' && userType === 'student') ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApprove(app.id)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(app.id)}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        {userType === 'school' ? 'Applications' : 'Invitations'}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : applications.length === 0 ? (
        <Typography>No applications found.</Typography>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <TextField
              label="Filter by School Name"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ mr: 2 }}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              size="small"
              sx={{ width: 200 }}
            >
              <MenuItem value="">All Applications</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="invited">Invited</MenuItem>
              <MenuItem value="approved">Approve</MenuItem>
              <MenuItem value="denied">Denied</MenuItem>
            </Select>
          </div>
          {renderApplicationsTable()}
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === 'approve' ? 'Approve Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'approve'
              ? 'Are you sure you want to approve this application?'
              : 'Are you sure you want to reject this application?'}
          </DialogContentText>
          {dialogAction === 'approve' && (
            <TextField
              autoFocus
              margin="dense"
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmAction} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications;
