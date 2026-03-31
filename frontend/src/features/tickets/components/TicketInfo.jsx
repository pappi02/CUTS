import { Typography, Box, Chip } from '@mui/material';

const TicketInfo = ({ ticket }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>{ticket.title}</Typography>
      <Typography variant="body1" paragraph>{ticket.description}</Typography>

      {ticket.location && (
        <Typography variant="body2"><strong>Location:</strong> {ticket.location}</Typography>
      )}

      {ticket.custom_fields && Object.keys(ticket.custom_fields).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Additional Information:</Typography>
          <Box component="dl">
            {Object.entries(ticket.custom_fields).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', mt: 1 }}>
                <Typography component="dt" variant="body2" sx={{ fontWeight: 'bold', width: 120 }}>{key}:</Typography>
                <Typography component="dd" variant="body2">{value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TicketInfo;

