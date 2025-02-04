import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const StudentViewing: React.FC<{ profile: any }> = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">Student Viewing Another Student</Typography>
      <Typography>Name: {profile.name}</Typography>
      <Typography>Student: {profile.student}</Typography>
    </CardContent>
  </Card>
);

export default StudentViewing;
