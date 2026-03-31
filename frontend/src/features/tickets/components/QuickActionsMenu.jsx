import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
} from '@mui/material';
import { MoreVert, Assignment, Update } from '@mui/icons-material';
import { useAssignTicketMutation, useUpdateTicketMutation } from '../ticketsApi';

const QuickActionsMenu = ({ ticket }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [assignTicket] = useAssignTicketMutation();
  const [updateTicket] = useUpdateTicketMutation();

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleAssign = async () => {
    if (selectedUserId) {
      await assignTicket({ ticketId: ticket.id, userId: selectedUserId });
      setAssignDialogOpen(false);
      setSelectedUserId('');
    }
  };

  const handleStatusChange = async () => {
    if (selectedStatus) {
      await updateTicket({ id: ticket.id, status: selectedStatus });
      setStatusDialogOpen(false);
      setSelectedStatus('');
    }
  };

  // Mock users (use useGetAgentsQuery in real)
  const users = [
    { id: 1, username: 'agent1' },
    { id: 2, username: 'agent2' },
    { id: 3, username: 'admin' },
  ];

  return (
    <>
      <IconButton onClick={handleOpen} size="small">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => { setAssignDialogOpen(true); handleClose(); }}>
          <ListItemIcon>
            <Assignment fontSize="small" />
          </ListItemIcon>
          <ListItemText>Assign</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setStatusDialogOpen(true); handleClose(); }}>
          <ListItemIcon>
            <Update fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Status</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Ticket #{ticket.id}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Agent</InputLabel>
            <Select
              value={selectedUserId}
              label="Agent"
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((user) => (
                <SelectMenuItem key={user.id} value={user.id}>
                  {user.username}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" disabled={!selectedUserId}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Status for Ticket #{ticket.id}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <SelectMenuItem value="open">Open</SelectMenuItem>
              <SelectMenuItem value="in_progress">In Progress</SelectMenuItem>
              <SelectMenuItem value="pending_requester">Pending Requester</SelectMenuItem>
              <SelectMenuItem value="resolved">Resolved</SelectMenuItem>
              <SelectMenuItem value="closed">Closed</SelectMenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusChange} variant="contained" disabled={!selectedStatus}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickActionsMenu;
