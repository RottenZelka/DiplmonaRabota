import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const StudentProfile = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">My Student Profile</Typography>
      <Typography>Email: {profile.email}</Typography>
      <Typography>Additional data specific to the student...</Typography>
    </CardContent>
  </Card>
);

export default StudentProfile;
