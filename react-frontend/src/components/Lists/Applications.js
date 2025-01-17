import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");
      try {
        const response = await axios.get("http://localhost:8888/api/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(response.data.applications || []);
      } catch (err) {
        setError("Failed to load applications. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleApply = async () => {
    setIsApplying(true);
    const token = localStorage.getItem("jwtToken");
    try {
      const response = await axios.post(
        "http://localhost:8888/api/applications/apply",
        { id: "school_id_here" }, // Replace with actual school ID
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "Application submitted!");
    } catch (err) {
      alert("Failed to apply. Please try again.");
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleActionClick = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!selectedApplication || !actionType) return;

    const token = localStorage.getItem("jwtToken");
    try {
      const response = await axios.post(
        `http://localhost:8888/api/applications/handle/${selectedApplication.id}`,
        { action: actionType, start_date: startDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || "Action completed!");
      setActionDialogOpen(false);
      setStartDate("");
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id
            ? { ...app, status: actionType }
            : app
        )
      );
    } catch (err) {
      alert("Failed to perform action. Please try again.");
      console.error(err);
    }
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
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.id}</TableCell>
              <TableCell>
                {app.school_id ? `School ID: ${app.school_id}` : `Student ID: ${app.student_id}`}
              </TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell>
                {app.status === "invited" ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleActionClick(app, "approved")}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleActionClick(app, "denied")}
                    >
                      Deny
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/application/${app.id}`)}
                  >
                    View Details
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
        Applications
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : applications.length === 0 ? (
        <Typography>No applications found.</Typography>
      ) : (
        renderApplicationsTable()
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleApply}
        disabled={isApplying}
        sx={{ mt: 3 }}
      >
        {isApplying ? "Applying..." : "Apply to a School"}
      </Button>
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
      >
        <DialogTitle>
          {actionType === "approved" ? "Approve Application" : "Deny Application"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleActionSubmit} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Applications;
