import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getPeriods, createPeriod, updatePeriod, deletePeriod } from '../../../services/api';
import { useAuthContext } from '../../../context/AuthContext';

interface PeriodData {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  type: string;
  other_type?: string;
}

const Period: React.FC = () => {
  const [periods, setPeriods] = useState<PeriodData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    type: 'school year',
    other_type: '',
  });
  const { user } = useAuthContext();

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await getPeriods();
      if (response.status === 'success') {
        setPeriods(response.periods || []);
      } else {
        console.error('Failed to fetch periods:', response.message);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const handleOpenDialog = (period?: PeriodData) => {
    if (period) {
      setEditingPeriod(period);
      setFormData({
        name: period.name,
        start_date: period.start_date,
        end_date: period.end_date || '',
        type: period.type,
        other_type: period.other_type || '',
      });
    } else {
      setEditingPeriod(null);
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        type: 'school year',
        other_type: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPeriod(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const periodData = {
        ...formData,
        school_id: user?.id,
      };

      let response;
      if (editingPeriod) {
        response = await updatePeriod(editingPeriod.id, periodData);
      } else {
        response = await createPeriod(periodData);
      }

      if (response.status === 'success') {
        await fetchPeriods();
        handleCloseDialog();
      } else {
        console.error('Failed to save period:', response.message);
      }
    } catch (error) {
      console.error('Error saving period:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deletePeriod(id);
      if (response.status === 'success') {
        await fetchPeriods();
      } else {
        console.error('Failed to delete period:', response.message);
      }
    } catch (error) {
      console.error('Error deleting period:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">School Periods</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Period
        </Button>
      </Box>

      <Grid container spacing={3}>
        {periods.map((period) => (
          <Grid item xs={12} md={6} lg={4} key={period.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{period.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(period)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(period.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="textSecondary">
                  {new Date(period.start_date).toLocaleDateString()} -{' '}
                  {period.end_date ? new Date(period.end_date).toLocaleDateString() : 'Present'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Type: {period.type}
                </Typography>
                {period.other_type && (
                  <Typography variant="body2" color="textSecondary">
                    Other Type: {period.other_type}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPeriod ? 'Edit Period' : 'Add New Period'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="name"
              label="Period Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="start_date"
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="end_date"
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="type"
              label="Type"
              value={formData.type}
              onChange={handleInputChange}
              fullWidth
              required
              select
              SelectProps={{ native: true }}
            >
              <option value="school year">School Year</option>
              <option value="vacation">Vacation</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </TextField>
            {formData.type === 'other' && (
              <TextField
                name="other_type"
                label="Other Type Description"
                value={formData.other_type}
                onChange={handleInputChange}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPeriod ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Period; 