import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Card, CardContent, Chip, List, ListItem, ListItemText, Button, Stack } from '@mui/material';
import { useGetTicketsQuery } from '../tickets/ticketsApi';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const metricItems = (stats) => [
  { label: 'Total Tickets', value: stats?.total || 0, color: 'primary' },
  { label: 'Open Tickets', value: stats?.open || 0, color: 'warning' },
  { label: 'Resolved Today', value: stats?.resolved_today || 0, color: 'success' },
  { label: 'Active Users', value: stats?.active_users || 0, color: 'secondary' },
  { label: 'SLA Compliance', value: `${stats?.sla_full || 0}%`, color: stats?.sla_full > 90 ? 'success' : 'error' },
];

const AdminOverviewDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState({ db: 'unknown', redis: 'unknown', celery: 'unknown' });
  const [metrics, setMetrics] = useState(null);

  const { data: allTicketsData, isLoading: ticketsLoading } = useGetTicketsQuery({ page_size: 1, ordering: '-created_at' });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await api.get('/admin/health/');
        setHealth(response.data);
      } catch (error) {
        setHealth({ db: 'unavailable', redis: 'unavailable', celery: 'unavailable' });
      }
    };

    const fetchMetrics = async () => {
      try {
        const response = await api.get('/admin/metrics/');
        setMetrics(response.data);
      } catch (error) {
        // fallback from tickets
        const total = allTicketsData?.count || 0;
        setMetrics({ total, open: allTicketsData?.results?.filter((t) => t.status !== 'resolved').length || 0, resolved_today: 0, active_users: 0, sla_full: 0 });
      }
    };

    fetchHealth();
    fetchMetrics();
  }, [allTicketsData]);

  const ticketVolumeCard = useMemo(() => {
    const count = allTicketsData?.count || 0;
    return `${count} total tickets`; 
  }, [allTicketsData]);

  return (
    <Box>
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #8e24aa, #ec407a)', color: '#fff', borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Admin Dashboard</Typography>
        <Typography variant="subtitle1">System and operations overview for administrators.</Typography>
      </Box>

      <Grid container spacing={3}>
        {(metrics ? metricItems(metrics) : []).map((metric) => (
          <Grid item xs={12} sm={6} md={4} key={metric.label}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">{metric.label}</Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>{metric.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Ticket Volume (snapshot)</Typography>
            <Typography>{ticketVolumeCard}</Typography>
            <Button sx={{ mt: 1 }} variant="contained" onClick={() => navigate('/reports')}>View Reports</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>System Health</Typography>
            <List>
              <ListItem><ListItemText primary="Database" secondary={health.db} /></ListItem>
              <ListItem><ListItemText primary="Redis" secondary={health.redis} /></ListItem>
              <ListItem><ListItemText primary="Celery" secondary={health.celery} /></ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Admin Quick Actions</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="outlined" onClick={() => navigate('/admin/schools')}>Manage Schools</Button>
              <Button variant="outlined" onClick={() => navigate('/admin/departments')}>Departments</Button>
              <Button variant="outlined" onClick={() => navigate('/admin/categories')}>Categories</Button>
              <Button variant="outlined" onClick={() => navigate('/admin/rules')}>Rules</Button>
              <Button variant="outlined" onClick={() => navigate('/admin/users')}>Users</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminOverviewDashboard;
