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
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getApplications, handleApplication } from '../../../services/api';
import TokenManager from '../../../utils/tokenManager';
import BadRequest from '../../errors/BadRequest';
import NotFound from '../../errors/NotFound';
import InternalServerError from '../../errors/InternalServerError';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../common/Pagination';

interface Application {
  id: string;
  student_id: string;
  school_id: string;
  school_name: string;
  status: string;
  created_at: string;
}

interface PaginationData {
  total_count: number;
  page_count: number;
  current_page: number;
  page_size: number;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [userType, setUserType] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<string>('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const navigate = useNavigate();

  const { pagination, handlePageChange: paginationHandlePageChange, updatePagination } = usePagination({
    onPageChange: (page) => fetchApplications(page)
  });

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const decodedToken = TokenManager.getDecodedToken();
        if (!decodedToken) {
          setError(true);
          setErrorCode(null);
          return;
        }

        setUserType(decodedToken.data.user_type);
        setUserId(decodedToken.data.user_id);
      } catch (error) {
        console.error('Failed to fetch user type:', error);
        setError(true);
        setErrorCode(null);
      }
    };

    fetchUserType();
  }, []);

  const fetchApplications = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pagination.page_size.toString());
      if (statusFilter) params.append('status_filter', statusFilter);

      const response = await getApplications(params);
      setApplications(response.applications);
      setFilteredApplications(response.applications);
      updatePagination(response.pagination);
      setError(false);
    } catch (err: any) {
      setError(true);
      if (err?.response?.status === 400) setErrorCode(400);
      else if (err?.response?.status === 404) setErrorCode(404);
      else if (err?.response?.status === 500) setErrorCode(500);
      else setErrorCode(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    paginationHandlePageChange(1);
  };

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

  if (errorCode === 400) return <BadRequest />;
  if (errorCode === 404) return <NotFound />;
  if (errorCode === 500) return <InternalServerError />;

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        {userType === 'school' ? 'Applications' : 'Invitations'}
      </Typography>
      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant={statusFilter === '' ? 'contained' : 'outlined'}
          onClick={() => handleStatusFilter('')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
          onClick={() => handleStatusFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === 'approved' ? 'contained' : 'outlined'}
          onClick={() => handleStatusFilter('approved')}
        >
          Approved
        </Button>
        <Button
          variant={statusFilter === 'rejected' ? 'contained' : 'outlined'}
          onClick={() => handleStatusFilter('rejected')}
        >
          Rejected
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">Failed to load applications. Please try again later.</Alert>
      ) : applications.length === 0 ? (
        <Typography>No applications found.</Typography>
      ) : (
        <>
          {renderApplicationsTable()}
          <Pagination
            count={pagination.page_count}
            page={pagination.current_page}
            onChange={paginationHandlePageChange}
            showTotal
            total={pagination.total_count}
          />
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
