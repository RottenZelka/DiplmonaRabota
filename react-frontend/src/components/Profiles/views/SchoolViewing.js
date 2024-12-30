import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const SchoolViewing = ({ profile }) => (
  <Card>
    <CardContent>
      <Typography variant="h4">School Viewing Another School</Typography>
      <Typography>Name: {profile.school.name}</Typography>
      <Typography>Email: {profile.email}</Typography>
    </CardContent>
  </Card>
);

export default SchoolViewing;
