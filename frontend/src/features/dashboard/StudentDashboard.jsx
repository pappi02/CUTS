import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Button, List, ListItem, ListItemText, TextField, Card, CardContent, Chip, IconButton, Stack } from '@mui/material';
import { Search as SearchIcon, Help as HelpIcon, Add as AddIcon } from '@mui/icons-material';
import { useGetTicketsQuery } from '../tickets/ticketsApi';
import { useGetArticlesQuery } from '../knowledgebase/knowledgebaseApi';
import { useAuth } from '../../hooks/useAuth';

const quickLinks = [
  { label: 'Fee Payment', href: 'https://fees.maseno.ac.ke' },
  { label: 'Course Registration', href: 'https://registration.maseno.ac.ke' },
  { label: 'Library', href: 'https://library.maseno.ac.ke' },
  { label: 'Student Email', href: 'https://mail.maseno.ac.ke' },
];

const announcements = [
  { id: 1, text: 'Maintenance window: Sunday 10pm-12am.' },
  { id: 2, text: 'New semester deadline for fee payment: April 15.' },
  { id: 3, text: 'Knowledge base search improved with AI tags.' },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ticketsData, isLoading: ticketsLoading } = useGetTicketsQuery({ requester: 'me', page_size: 5, ordering: '-created_at' });
  const { data: articlesData, isLoading: articlesLoading } = useGetArticlesQuery({ popular: true, page_size: 5 });

  const ticketList = ticketsData?.results || [];
  const articleList = articlesData?.results || [];

  return (
    <Box>
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #3f51b5, #673ab7)', borderRadius: 2, color: '#fff', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Welcome back, {user?.first_name || user?.username}!</Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>Here’s a quick snapshot of your student support dashboard.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ minHeight: 220, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>My Active Tickets</Typography>
              {ticketsLoading ? (
                <Typography color="text.secondary">Loading...</Typography>
              ) : ticketList.length === 0 ? (
                <Typography color="text.secondary">No active tickets. Start by creating one.</Typography>
              ) : (
                <List dense>
                  {ticketList.map((ticket) => (
                    <ListItem key={ticket.id} button onClick={() => navigate(`/tickets/${ticket.id}`)}>
                      <ListItemText
                        primary={`#${ticket.id} ${ticket.title}`}
                        secondary={`${ticket.status?.toUpperCase() || 'UNKNOWN'} - ${new Date(ticket.created_at).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button size="small" startIcon={<AddIcon />} onClick={() => navigate('/tickets/new')}>
                New Ticket
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ minHeight: 220 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Knowledge Base</Typography>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search FAQs..."
                  fullWidth
                  size="small"
                />
                <IconButton aria-label="search" sx={{ ml: 1 }} onClick={() => navigate('/knowledgebase')}> <SearchIcon /> </IconButton>
              </Box>
              {articlesLoading ? (
                <Typography color="text.secondary">Loading top articles...</Typography>
              ) : (
                <List dense>
                  {articleList.map((article) => (
                    <ListItem key={article.id} button onClick={() => navigate(`/knowledgebase/${article.id}`)}>
                      <ListItemText primary={article.title} />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button size="small" startIcon={<HelpIcon />} onClick={() => navigate('/knowledgebase')}>
                Explore KB
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ minHeight: 220, bgcolor: '#f4f6fb' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Announcements</Typography>
              <Stack spacing={1}>
                {announcements.map((item) => (
                  <Chip key={item.id} label={item.text} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" onClick={() => navigate('/tickets/new')} startIcon={<AddIcon />}>New Ticket</Button>
              <Button variant="outlined" onClick={() => navigate('/tickets')} >View My Tickets</Button>
              <Button variant="outlined" onClick={() => navigate('/knowledgebase')} >Search KB</Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Student Quick Links</Typography>
            <Stack spacing={1}>
              {quickLinks.map((link) => (
                <Button key={link.label} variant="outlined" fullWidth component="a" href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
