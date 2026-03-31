import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import QuickActionsMenu from './QuickActionsMenu';
import { useTheme } from '@mui/material/styles';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'p1': return 'error';
    case 'p2': return 'warning';
    case 'p3': return 'info';
    case 'p4': return 'success';
    default: return 'default';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'default';
    case 'open': return 'primary';
    case 'in_progress': return 'warning';
    case 'pending_requester': return 'info';
    case 'resolved': return 'success';
    case 'closed': return 'default';
    default: return 'default';
  }
};

const TicketTable = ({ tickets, totalCount, page, pageSize, onPageChange, onPageSizeChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAgent = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'faculty';

  const handleRowClick = (id, e) => {
    if (e.target.closest('button') || e.target.closest('[role="button"]')) return;
    navigate(`/tickets/${id}`);
  };

  if (isMobile) {
    // Card view for mobile
    return (
      <Box>
        <Box sx={{ display: 'grid', gap: 2, mb: 2 }}>
          {tickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="glass-card kpi-card"
              onClick={(e) => handleRowClick(ticket.id, e)}
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(99,102,241,0.3)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} noWrap sx={{ maxWidth: '70%' }}>
                    #{ticket.id}
                  </Typography>
                  <Chip label={ticket.priority?.toUpperCase() || 'N/A'} color={getPriorityColor(ticket.priority)} size="small" />
                </Box>
                <Typography variant="body1" gutterBottom noWrap sx={{ mb: 1 }}>
                  {ticket.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={ticket.status?.replace('_', ' ') || 'Unknown'} color={getStatusColor(ticket.status)} size="small" />
                  <Chip label={ticket.assigned_to?.username || 'Unassigned'} variant="outlined" size="small" color="primary" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(ticket.created_at).toLocaleDateString()}
                </Typography>
                {isAgent && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <QuickActionsMenu ticket={ticket} />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
        <TablePagination
          component="div"
          count={totalCount}
          page={page - 1}
          onPageChange={onPageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={onPageSizeChange}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Box>
    );
  }

  // Desktop table view
  return (
    <Box flexGrow={1}>
      <TableContainer component={Paper} className="glass-card">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Created</TableCell>
              {isAgent && <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                hover
                sx={{ 
                  cursor: 'pointer',
                  '&:hover td': { bgcolor: 'rgba(99,102,241,0.05)' }
                }}
                onClick={(e) => handleRowClick(ticket.id, e)}
              >
                <TableCell sx={{ fontWeight: 600 }}><Chip label={`#${ticket.id}`} color="primary" size="small" /></TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body1" fontWeight={500}>{ticket.title}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.status?.replace('_', ' ') || 'Unknown'}
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.priority?.toUpperCase() || 'N/A'}
                    color={getPriorityColor(ticket.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={ticket.assigned_to?.username || 'Unassigned'} 
                    variant="outlined" 
                    size="small" 
                    color="secondary" 
                  />
                </TableCell>
                <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                {isAgent && (
                  <TableCell align="right" sx={{ cursor: 'default' }}>
                    <QuickActionsMenu ticket={ticket} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page - 1}
        onPageChange={onPageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={onPageSizeChange}
        rowsPerPageOptions={[10, 20, 50]}
        sx={{ mt: 2, bgcolor: 'rgba(30,41,59,0.5)', borderRadius: 2 }}
      />
    </Box>
  );
};

export default TicketTable;

