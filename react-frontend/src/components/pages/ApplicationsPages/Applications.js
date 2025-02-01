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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getApplications } from "../../../services/api";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolFilter, setSchoolFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");
    
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
        app.school_name ? `School name: ${app.school_name}`.toLowerCase().includes(schoolFilter.toLowerCase()) : true
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  useEffect(() => {
    handleFilterChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolFilter, statusFilter]);

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
                {app.school_id ? `School name: ${app.school_name}` : `Student ID: ${app.student_id}`}
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
                {app.status === "invited" && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => console.log("Accepting application:", app.id)}
                      sx={{ mr: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => console.log("Rejecting application:", app.id)}
                    >
                      Reject
                    </Button>
                  </>
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
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="denied">Denied</MenuItem>
            </Select>
          </div>
          {renderApplicationsTable()}
        </>
      )}
    </Container>
  );
};

export default Applications;
