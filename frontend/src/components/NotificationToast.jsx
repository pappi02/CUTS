import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { removeNotification } from '../store/slices/uiSlice';

const NotificationToast = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.ui.notifications);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      setCurrentNotification(notifications[0]);
      setOpen(true);
    }
  }, [notifications, currentNotification]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleExited = () => {
    if (currentNotification) {
      dispatch(removeNotification(currentNotification.id));
      setCurrentNotification(null);
    }
  };

  if (!currentNotification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity="info" 
        sx={{ width: '100%' }}
        variant="filled"
      >
        <strong>{currentNotification.title}</strong>: {currentNotification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;

