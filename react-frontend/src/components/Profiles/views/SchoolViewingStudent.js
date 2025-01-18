import React, { useState } from "react";
import { Button, Card, CardContent, Typography } from '@mui/material';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SchoolViewingStudent = ({ profile }) => {

  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();
  
  const handleInvite = async () => {
    setIsApplying(true);
    const token = localStorage.getItem("jwtToken");
    try {
      // const response = await axios.post(
      //   `http://localhost:8888/api/application/${profile.student.user_id}`,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      // alert(response.data.message || "Application submitted!");
      navigate(`/apply/${profile.student.user_id}`)
    } catch (err) {
      alert("Failed to apply. Please try again.");
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  return(
    <Card>
      <CardContent>
        <Typography variant="h4">School Viewing a Student</Typography>
        <Typography>Student Name: {profile.student.name}</Typography>
        <Typography>Student School: {profile.student.school_name}</Typography>
        <Button
        onClick={handleInvite}
        > Invite Student Now </Button>
      </CardContent>
    </Card>
  );
};

export default SchoolViewingStudent;
