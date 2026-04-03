import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Button, List, ListItem, ListItemText, Chip, LinearProgress, Stack } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useGetTicketsQuery } from '../tickets/ticketsApi';
import api from '../../services/api';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: myTicketsData, isLoading: myTicketsLoading } = useGetTicketsQuery({ assigned_to: 'me', page_size: 10, ordering: '-created_at' });
  const { data: unassignedData, isLoading: unassignedLoading } = useGetTicketsQuery({ assigned_to: 'null', page_size: 10, ordering: '-created_at' });

  const [slaData, setSlaData] = useState([]);
  const [slaLoading, setSlaLoading] = useState(true);

  useEffect(() => {
    const loadSla = async () => {
      setSlaLoading(true);
      try {
        const response = await api.get('/reports/sla-compliance/', { params: { group_by: 'assigned_group' } });
        setSlaData(response.data.slice(0, 5));
      } catch (error) {
        console.error('Unable to fetch SLA compliance', error);
      } finally {
        setSlaLoading(false);
      }
    };
    loadSla();
  }, []);

  const recentActivity = [
    'New ticket assigned to You',
    'Ticket #124 updated to in-progress',
    'Ticket #89 received new internal note',
    'SLA met for Ticket #72',
  ];

  return (
    <Box>
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #0288d1, #26c6da)', color: '#fff', borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Hello, {user?.first_name || user?.username}</Typography>
        <Typography variant="subtitle1">Your staff dashboard gives you quick access to assignments and group workloads.</Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" mb={2}>Assigned to Me</Typography>
            {myTicketsLoading ? (
              <Typography>Loading...</Typography>
            ) : !myTicketsData?.results?.length ? (
              <Typography>No assigned tickets.</Typography>
            ) : (
              <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
                {myTicketsData.results.map((ticket) => (
                  <ListItem key={ticket.id} button onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    <ListItemText primary={`#${ticket.id} ${ticket.title}`} secondary={ticket.status} />
                  </ListItem>
                ))}
              </List>
            )}
            <Button sx={{ mt: 2 }} fullWidth variant="contained" onClick={() => navigate('/tickets')}>View all my tickets</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" mb={2}>Unassigned Tickets</Typography>
            {unassignedLoading ? (
              <Typography>Loading...</Typography>
            ) : !unassignedData?.results?.length ? (
              <Typography>All tickets are assigned.</Typography>
            ) : (
              <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
                {unassignedData.results.map((ticket) => (
                  <ListItem key={ticket.id} button onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    <ListItemText primary={`#${ticket.id} ${ticket.title}`} secondary={ticket.category || ticket.priority} />
                  </ListItem>
                ))}
              </List>
            )}
            <Button sx={{ mt: 2 }} fullWidth variant="outlined" onClick={() => navigate('/tickets?assigned_to=null')}>
              Claim/unassign
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={12} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" mb={2}>SLA Compliance</Typography>
            {slaLoading ? (
              <Typography>Loading SLA data...</Typography>
            ) : slaData.length === 0 ? (
              <Typography>No SLA data available.</Typography>
            ) : (
              <Stack spacing={1}>
                {slaData.map((group) => (
                  <Box key={group.assigned_group}>
                    <Typography variant="subtitle2" fontWeight={600}>{group.assigned_group || 'Unassigned Group'}</Typography>
                    <LinearProgress variant="determinate" value={Number(group.sla_percentage || 0)} />
                    <Typography variant="caption">{Number(group.sla_percentage || 0).toFixed(1)}% met</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Recent Activity</Typography>
            <List dense>
              {recentActivity.map((activity, index) => (
                <ListItem key={index}>
                  <ListItemText primary={activity} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffDashboard;
