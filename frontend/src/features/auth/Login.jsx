import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const result = await login(username, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setSubmitError(result.error || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e88e5 50%, #43a047 100%)',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={12} 
          sx={{ 
            p: { xs: 4, sm: 5 }, 
            width: '100%',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #1e88e5, #43a047)',
              borderRadius: '12px 12px 0 0',
            },
          }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CUTS
          </Typography>
          <Typography component="p" variant="h6" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            Maseno University Ticketing System
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {(error || submitError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || submitError}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Sign In'}
            </Button>
            <Typography variant="body2" color="text.secondary" align="center">
              Demo: user1 / password123 | admin1 / adminpass
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;

