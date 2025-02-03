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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getApplications, handleApplication } from "../../../services/api";
import { jwtDecode } from "jwt-decode";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const decodedToken = jwtDecode(token);
        setUserType(decodedToken.data.user_type);
        setUserId(decodedToken.data.user_id);
      } catch (error) {
        console.error("Failed to fetch user type:", error);
        setError("Failed to fetch user type. Please try again.");
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
        setError("Failed to load applications. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleFilterChange = () => {
    let filtered = applications;

    if (schoolFilter) {
      filtered = filtered.filter((app) =>
        app.school_name ? app.school_name.toLowerCase().includes(schoolFilter.toLowerCase()) : true
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [schoolFilter, statusFilter]);

  const handleApprove = async (applicationId) => {
    setSelectedApplicationId(applicationId);
    setDialogAction("approved");
    setOpenDialog(true);
  };

  const handleReject = async (applicationId) => {
    setSelectedApplicationId(applicationId);
    setDialogAction("reject");
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    setOpenDialog(false);
    setLoading(true);
    setError(null);

    try {
      const response = await handleApplication(selectedApplicationId, {
        action: dialogAction,
        start_date: startDate,
      });

      if (response.status === "success") {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplicationId
              ? { ...app, status: dialogAction === "approved" ? "approved" : "denied" }
              : app
          )
        );
        setFilteredApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplicationId
              ? { ...app, status: dialogAction === "approved" ? "approved" : "denied" }
              : app
          )
        );
        setStartDate("");
        setMessage({ type: "success", text: response.message });
      } else {
        setError(response.message || "Failed to update application status.");
      }
    } catch (err) {
      setError("Failed to update application status. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setStartDate("");
    setSelectedApplicationId(null);
    setDialogAction("");
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
                {userType === "school"
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
                {(app.status === "pending" && userType === "school") ||
                  (app.status === "invited" && userType === "student") ? (
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
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
        {userType === "school" ? "Applications" : "Invitations"}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : applications.length === 0 ? (
        <Typography>No applications found.</Typography>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
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
        <DialogTitle>{dialogAction === "approved" ? "approved" : "Reject"} Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === "approved"
              ? "Are you sure you want to approve this application?"
              : "Are you sure you want to reject this application?"}
          </DialogContentText>
          {dialogAction === "approved" && (
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
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

export default Applications;
