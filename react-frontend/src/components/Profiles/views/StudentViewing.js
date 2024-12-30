import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const StudentViewing = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">Student Viewing Another Student</Typography>
      <Typography>Name: {profile.name}</Typography>
      <Typography>School: {profile.school}</Typography>
    </CardContent>
  </Card>
);

export default StudentViewing;
