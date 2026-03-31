import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  FormControlLabel,
  Switch,
  Paper,
} from '@mui/material';
import { useAddCommentMutation } from '../ticketsApi';
import { useAuth } from '../../../hooks/useAuth';

const CommentSection = ({ ticket, canEdit }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [addComment, { isLoading }] = useAddCommentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment({
      ticketId: ticket.id,
      comment: { content: newComment, is_internal: isInternal },
    });
    setNewComment('');
    // RTK Query will automatically refetch the ticket due to tag invalidation
  };

  // Filter comments based on user role
  const visibleComments = ticket.comments?.filter((comment) => {
    if (!comment.is_internal) return true;
    // Internal note: visible only if user is agent (admin/staff/faculty) or the author
    return canEdit || comment.user?.id === user?.id;
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Comments</Typography>

      <List>
        {visibleComments?.map((comment) => (
          <Paper key={comment.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
            <ListItem alignItems="flex-start" disablePadding>
              <ListItemAvatar>
                <Avatar>{comment.user?.username[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle2">{comment.user?.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.created_at).toLocaleString()}
                      {comment.is_internal && <Chip label="internal" size="small" sx={{ ml: 1 }} />}
                    </Typography>
                  </Box>
                }
                secondary={comment.content}
              />
            </ListItem>
          </Paper>
        ))}
        {visibleComments?.length === 0 && (
          <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
        )}
      </List>

      {canEdit && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  color="warning"
                />
              }
              label="Internal note (only visible to agents)"
            />
            <Button type="submit" variant="contained" disabled={isLoading || !newComment.trim()}>
              Post Comment
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CommentSection;

