import { useParams } from 'react-router-dom';
import { useGetTicketQuery, useResolveTicketMutation, useReopenTicketMutation } from './ticketsApi';
import { useAuth } from '../../hooks/useAuth';
import {
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { CheckCircle, Replay } from '@mui/icons-material';
import TicketInfo from './components/TicketInfo';
import CommentSection from './components/CommentSection';
import ActivityLog from './components/ActivityLog';

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: ticket, isLoading, error, refetch } = useGetTicketQuery(id);
  const [resolveTicket, { isLoading: resolving }] = useResolveTicketMutation();
  const [reopenTicket, { isLoading: reopening }] = useReopenTicketMutation();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading ticket: {error.data?.detail || error.message}</Alert>;
  }

  const canEdit = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'faculty' || user?.id === ticket.assigned_to?.id;

  const handleResolve = async () => {
    await resolveTicket(id);
    refetch();
  };

  const handleReopen = async () => {
    await reopenTicket(id);
    refetch();
  };

  const getStatusActions = () => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return (
        <Button
          variant="contained"
          color="primary"
          startIcon={<Replay />}
          onClick={handleReopen}
          disabled={reopening}
        >
          Reopen Ticket
        </Button>
      );
    } else {
      return (
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircle />}
          onClick={handleResolve}
          disabled={resolving}
        >
          Resolve Ticket
        </Button>
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Header with ID and status */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Ticket #{ticket.id}</Typography>
              <Chip
                label={ticket.status.replace('_', ' ')}
                color={ticket.status === 'resolved' ? 'success' : ticket.status === 'closed' ? 'default' : 'primary'}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            {/* Main ticket information */}
            <TicketInfo ticket={ticket} />

            <Divider sx={{ my: 3 }} />

            {/* Comment Section */}
            <CommentSection ticket={ticket} canEdit={canEdit} />
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Sidebar with actions and metadata */}
            <Stack spacing={2}>
              {canEdit && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Actions</Typography>
                  <Stack direction="row" spacing={1}>
                    {getStatusActions()}
                  </Stack>
                </Paper>
              )}

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Details</Typography>
                <Box>
                  <Typography variant="body2"><strong>Requester:</strong> {ticket.requester?.username}</Typography>
                  <Typography variant="body2"><strong>Assigned To:</strong> {ticket.assigned_to?.username || 'Unassigned'}</Typography>
                  <Typography variant="body2"><strong>Group:</strong> {ticket.assigned_group?.name}</Typography>
                  <Typography variant="body2"><strong>Category:</strong> {ticket.category?.name}</Typography>
                  <Typography variant="body2"><strong>Priority:</strong> {ticket.priority}</Typography>
                  <Typography variant="body2"><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</Typography>
                  <Typography variant="body2"><strong>Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</Typography>
                  {ticket.resolved_at && <Typography variant="body2"><strong>Resolved:</strong> {new Date(ticket.resolved_at).toLocaleString()}</Typography>}
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Attachments</Typography>
                {ticket.attachments?.length > 0 ? (
                  <ul>
                    {ticket.attachments.map((att) => (
                      <li key={att.id}>
                        <a href={att.url} target="_blank" rel="noopener noreferrer">{att.filename}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="body2">No attachments</Typography>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Activity Log</Typography>
                <ActivityLog ticket={ticket} />
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TicketDetail;

