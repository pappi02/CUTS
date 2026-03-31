// Phase 6: Admin Dashboard Component
import { Typography, Container, Tabs, Tab, Box, Link, Chip } from '@mui/material';
import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Quick Links
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip 
            label="Manage Schools" 
            color="primary" 
            onClick={() => navigate('/admin/schools')}
            clickable 
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Departments" 
            color="secondary" 
            onClick={() => navigate('/admin/departments')}
            clickable 
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Categories" 
            color="success" 
            onClick={() => navigate('/admin/categories')}
            clickable 
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Groups" 
            onClick={() => navigate('/admin/groups')}
            clickable 
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="Rules" 
            color="warning" 
            onClick={() => navigate('/admin/rules')}
            clickable 
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;

