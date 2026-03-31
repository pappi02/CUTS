import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import useWebSocket from '../hooks/useWebSocket';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import NotificationToast from './NotificationToast';
import { toggleSidebar, setShowScrollToTop, scrollToTop } from '../store/slices/uiSlice';
import ProfileDropdown from './ProfileDropdown';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  Fab,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon, // replaced Ticket
  Article as ArticleIcon,
  BarChart as BarChartIcon,
  AdminPanelSettings as AdminIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const AppLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const showScrollToTop = useSelector((state) => state.ui.showScrollToTop);
  useInactivityLogout();
  useWebSocket();

  // Scroll to top handler
  const handleScrollToTop = () => {
    dispatch(scrollToTop());
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Scroll listener for show button
  const handleScroll = () => {
    dispatch(setShowScrollToTop(window.scrollY > 300));
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); 

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
        <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          height: { xs: 64, sm: 72 },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => dispatch(toggleSidebar())}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CUTS - Maseno University Ticket System
          </Typography>
          <ProfileDropdown />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            display: { xs: 'block', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Toolbar />
          <Divider />
          <List>
            <ListItem button component={Link} to="/dashboard">
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/tickets">
              <ListItemIcon><TicketIcon /></ListItemIcon>
              <ListItemText primary="Tickets" />
            </ListItem>
            <ListItem button component={Link} to="/tickets/new">
              <ListItemIcon><TicketIcon /></ListItemIcon>
              <ListItemText primary="New Ticket" />
            </ListItem>
            <ListItem button component={Link} to="/knowledgebase">
              <ListItemIcon><ArticleIcon /></ListItemIcon>
              <ListItemText primary="Knowledge Base" />
            </ListItem>
            <ListItem button component={Link} to="/reports">
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Reports" />
            </ListItem>
            <ListItem button component={Link} to="/admin">
              <ListItemIcon><AdminIcon /></ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItem>
          </List>
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '64px', sm: '72px' },
          minHeight: '100vh',
background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.8) 30%)',
        }}
      >
        {children}
      </Box>
      <NotificationToast />
      {showScrollToTop && (
        <Fab 
          color="primary" 
          onClick={handleScrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 20,
            zIndex: 1000,
          }}
        >
          <ArrowUpIcon />
        </Fab>
      )}
    </Box>
  );
};

export default AppLayout;
