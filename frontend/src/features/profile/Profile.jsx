import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import { Person, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          User not found. Please log in again.
        </Typography>
      </Container>
    );
  }

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2rem',
          }}
        >
          {getInitials()}
        </Avatar>
        
        <Typography variant="h4" gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          @{user.username}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {user.email}
        </Typography>
        
        <Chip
          icon={<Person />}
          label={user.role.toUpperCase()}
          color="primary"
          variant="outlined"
          sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
        />
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            sx={{ mr: 2 }}
            onClick={() => navigate('/profile/edit')} // Placeholder for future edit page
          >
            Edit Profile
          </Button>
          <Button variant="contained">Change Password</Button>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Role:</Typography>
            <Typography variant="body2">{user.role}</Typography>
          </Box>
          {/* Add more fields as backend exposes more user data */}
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;

