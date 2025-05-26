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
import { getSavedSchools, deleteSavedSchool } from '../../../services/api';

interface SavedSchool {
  id: string;
  student_id: string;
  school_id: string;
  school_name: string;
  student_name: string;
  level_names?: string[];
}

const SavedSchoolsPage: React.FC = () => {
  const [savedSchools, setSavedSchools] = useState<SavedSchool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<string>('');
  const [selectedSavedSchoolId, setSelectedSavedSchoolId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedSchools = async () => {
      setLoading(true);
      try {
        const response = await getSavedSchools();

        if (response && response.status === 'success' && Array.isArray(response.saved_schools)) {
          setSavedSchools(response.saved_schools);
        } else {
          console.error('Invalid response format:', response);
          setError('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching saved schools:', err);
        setError('Failed to load saved schools. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSchools();
  }, []);

  const handleDelete = (id: string) => {
    setSelectedSavedSchoolId(id);
    setDialogAction('delete');
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    setOpenDialog(false);
    setLoading(true);
    setError(null);

    try {
      if (dialogAction === 'delete') {
        const response = await deleteSavedSchool(selectedSavedSchoolId!);
        if (response.status === 'success') {
          setSavedSchools((prev) => prev.filter((school) => school.id !== selectedSavedSchoolId));
          setSelectedSavedSchoolId(null);
        } else {
          setError(response.message || 'Failed to delete saved school.');
        }
      }
    } catch (err) {
      setError('Failed to perform action. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogAction('');
    setSelectedSavedSchoolId(null);
  };

  const renderSavedSchoolsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>School Name</TableCell>
              <TableCell>Levels</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {savedSchools.map((school) => (
              <TableRow
                key={school.id}
                onClick={() => navigate(`/profile/${school.school_id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{school.school_name}</TableCell>
                <TableCell>
                  {Array.isArray(school.level_names) && school.level_names.length > 0
                    ? school.level_names.join(', ')
                    : 'No levels specified'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(school.id);
                    }}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Saved Schools
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : savedSchools.length === 0 ? (
        <Typography>No saved schools found.</Typography>
      ) : (
        <>
          {renderSavedSchoolsTable()}
        </>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Delete Saved School</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this saved school?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmAction} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SavedSchoolsPage;
