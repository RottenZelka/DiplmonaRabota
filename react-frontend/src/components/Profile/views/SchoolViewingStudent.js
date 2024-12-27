import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const SchoolViewingStudent = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">School Viewing a Student</Typography>
      <Typography>Student Name: {profile.name}</Typography>
      <Typography>Student School: {profile.school}</Typography>
    </CardContent>
  </Card>
);

export default SchoolViewingStudent;
