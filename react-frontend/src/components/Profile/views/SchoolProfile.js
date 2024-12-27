import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const SchoolProfile = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">My School Profile</Typography>
      <Typography>School Name: {profile.name}</Typography>
      <Typography>Details about the school...</Typography>
    </CardContent>
  </Card>
);

export default SchoolProfile;
