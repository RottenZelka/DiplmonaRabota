import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const NonUserSchool = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">NonUser Viewing School</Typography>
      <Typography>Name: {profile.school.name}</Typography>
      <Typography>Email: {profile.email}</Typography>
    </CardContent>
  </Card>
);

export default NonUserSchool;
