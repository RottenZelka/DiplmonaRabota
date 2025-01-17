import React, { useState } from "react";
import { Card, CardContent, Typography, Button } from '@mui/material';
import axios from "axios";

const StudentViewingSchool = ({ profile }) => {
  
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    const token = localStorage.getItem("jwtToken");
    console.log (profile);
    try {
      const response = await axios.post(
        `http://localhost:8888/api/application/${profile.school.user_id}`,
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

  return(
    <Card>
      <CardContent>
        <Typography variant="h4">Student Viewing a School</Typography>
        <Typography>School Name: {profile.school.name}</Typography>
        <Typography>School Email: {profile.email}</Typography>
        <Button
        onClick={handleApply}
        > Apply For School Now </Button>
      </CardContent>
    </Card>
  )
};

export default StudentViewingSchool;
