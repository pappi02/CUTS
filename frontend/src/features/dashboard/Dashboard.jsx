import { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Card, 
  CardContent, 
  Chip, 
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGetTicketsQuery } from '../tickets/ticketsApi';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: unassignedData } = useGetTicketsQuery({ assigned_to: 'null', page_size: 5 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tickets/stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Chip label="Loading dashboard..." color="primary" size="large" />
      </Box>
    );
  }

  const statusData = stats?.status_counts.map(item => ({
    name: item.status.replace('_', ' '),
    count: item.count,
  })) || [];

  const priorityData = stats?.priority_counts.map(item => ({
    name: item.priority === 'p1' ? 'Critical' :
          item.priority === 'p2' ? 'High' :
          item.priority === 'p3' ? 'Medium' : 'Low',
    count: item.count,
    priority: item.priority,
  })) || [];

  const priorityColors = {
    p1: '#ef4444',
    p2: '#f59e0b',
    p3: '#3b82f6',
    p4: '#10b981',
  };

  const kpiData = [
    { title: 'Total Tickets', value: stats?.total_count || 0, icon: TicketIcon, color: 'primary' },
    { title: 'Open Tickets', value: stats?.open_count || 0, icon: TrendingIcon, color: 'secondary' },
    { title: 'Unassigned', value: stats?.unassigned_count || 0, icon: AssignmentIcon, color: 'warning' },
    { title: 'SLA Compliance', value: `${stats?.sla_compliance || 0}%`, icon: SpeedIcon, color: stats?.sla_compliance > 90 ? 'success' : 'error' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box className="hero-gradient" sx={{ p: 4, mb: 4, borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Here's what's happening with your tickets. SLA compliance: <Chip label={`${stats?.sla_compliance || 0}%`} color={stats?.sla_compliance > 90 ? 'success' : 'warning'} />
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="kpi-card glass-card" sx={{ height: '100%', '&:hover': { transform: 'translateY(-10px)' } }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ mb: 2, mx: 'auto', bgcolor: `${kpi.color}.main`, width: 56, height: 56 }}>
                  <kpi.icon />
                </Avatar>
                <Typography variant="h4" fontWeight={800} gutterBottom color="primary.main">
                  {kpi.value}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {kpi.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Charts */}
        <Grid item xs={12} lg={8}>
          <Paper className="glass-card" sx={{ p: 3, height: 400 }}>
            <Typography variant="h5" gutterBottom>Tickets by Status & Priority</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                <XAxis dataKey="name" stroke="#cbd5e1" fontWeight={600} />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="url(#statusGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper className="glass-card" sx={{ p: 3, height: 400 }}>
            <Typography variant="h5" gutterBottom>Priority Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="name"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={priorityColors[entry.priority]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quick Actions & Unassigned */}
        <Grid item xs={12} md={6}>
          <Paper className="glass-card" sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom mb={3}>
              Unassigned Tickets ({stats?.unassigned_count})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {unassignedData?.results?.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {unassignedData.results.slice(0, 5).map(ticket => (
                  <ListItem 
                    key={ticket.id} 
                    button 
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
                  >
                    <Box>
                      <Typography variant="h6" noWrap sx={{ maxWidth: 200 }}>
                        #{ticket.id} - {ticket.title}
                      </Typography>
                      <Chip label={ticket.priority?.toUpperCase()} size="small" color={ticket.priority === 'p1' ? 'error' : 'default'} />
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box className="empty-state">
                <TicketIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">No unassigned tickets</Typography>
              </Box>
            )}
            {stats?.unassigned_count > 5 && (
              <Button fullWidth variant="contained" onClick={() => navigate('/tickets?assigned_to=null')} sx={{ mt: 2 }}>
                View All
              </Button>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper className="glass-card" sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recent Activity <NotificationIcon sx={{ ml: 1, fontSize: 28, color: 'secondary.main' }} />
            </Typography>
            <Stack spacing={2}>
              {['Ticket #123 resolved by Alice', 'New comment on Ticket #456', 'SLA approaching for Ticket #789'].map((activity, idx) => (
                <Box key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.05)' }}>
                  <Typography variant="body2" color="text.secondary">{activity}</Typography>
                </Box>
              ))}
              <Button variant="outlined" startIcon={<NotificationIcon />}>
                View All Notifications
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

