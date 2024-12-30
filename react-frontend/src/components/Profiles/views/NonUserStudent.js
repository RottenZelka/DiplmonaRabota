import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const NonUserStudent = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">NonUser Viewing Student</Typography>
      <Typography>Name: {profile.name}</Typography>
      <Typography>Email: {profile.email}</Typography>
    </CardContent>
  </Card>
);

export default NonUserStudent;
