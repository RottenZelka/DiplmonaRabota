import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const StudentViewingSchool = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">Student Viewing a School</Typography>
      <Typography>School Name: {profile.name}</Typography>
      <Typography>School Email: {profile.email}</Typography>
    </CardContent>
  </Card>
);

export default StudentViewingSchool;
