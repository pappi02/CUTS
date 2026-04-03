import StudentDashboard from './StudentDashboard';
import StaffDashboard from './StaffDashboard';
import AdminOverviewDashboard from './AdminOverviewDashboard';
import { useAuth } from '../../hooks/useAuth';
import { Box, Typography } from '@mui/material';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Typography sx={{ p: 4 }}>Loading user...</Typography>;
  }

  if (user.role === 'student') {
    return <StudentDashboard />;
  }

  if (user.role === 'staff' || user.role === 'faculty') {
    return <StaffDashboard />;
  }

  if (user.role === 'admin') {
    return <AdminOverviewDashboard />;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">No dashboard available for your role</Typography>
    </Box>
  );
};

export default Dashboard;
