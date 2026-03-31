import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Typography } from '@mui/material';
import { Assignment, Update, CheckCircle, Replay, Add } from '@mui/icons-material';

const getIcon = (type) => {
  switch (type) {
    case 'status_change': return <Update color="info" />;
    case 'assignment': return <Assignment color="primary" />;
    case 'resolve': return <CheckCircle color="success" />;
    case 'reopen': return <Replay color="warning" />;
    case 'create': return <Add color="secondary" />;
    default: return <Update />;
  }
};

const ActivityLog = ({ ticket }) => {
  // For now, we can derive activity from ticket fields and comments
  // Ideally, the backend would provide a dedicated activity log endpoint.
  // We'll create a simple timeline based on ticket creation and comments.

  const activities = [];

  // Ticket creation
  activities.push({
    id: 'create',
    type: 'create',
    user: ticket.requester?.username,
    timestamp: ticket.created_at,
    description: 'Ticket created',
  });

  // Status changes (if we had a history model, we'd fetch it; for now we approximate)
  // We could parse comments for status change notifications if the backend adds them.
  // For demonstration, we'll just show resolved_at if present.
  if (ticket.resolved_at) {
    activities.push({
      id: 'resolve',
      type: 'resolve',
      user: ticket.assigned_to?.username,
      timestamp: ticket.resolved_at,
      description: 'Ticket resolved',
    });
  }

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Timeline position="right" sx={{ p: 0 }}>
      {activities.map((activity) => (
        <TimelineItem key={activity.id}>
          <TimelineSeparator>
            <TimelineDot color="grey">{getIcon(activity.type)}</TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body2">{activity.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(activity.timestamp).toLocaleString()} by {activity.user || 'System'}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default ActivityLog;

