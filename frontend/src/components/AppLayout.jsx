import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import useWebSocket from '../hooks/useWebSocket';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import NotificationToast from './NotificationToast';
import { toggleSidebar, setShowScrollToTop, scrollToTop, setSidebarOpen } from '../store/slices/uiSlice';
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

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 600; // sm breakpoint
      // Only auto-adjust on resize, not on every state change
      if (isDesktop) {
        dispatch(setSidebarOpen(true));
      } else {
        dispatch(setSidebarOpen(false));
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]); // Remove sidebarOpen from dependencies 

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
        <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, sm: `${drawerWidth}px` },
          height: { xs: 64, sm: 72 },
          zIndex: { xs: 1300, sm: 'auto' }, // Ensure AppBar is above mobile sidebar
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
        {/* Mobile Sidebar - Custom implementation to avoid aria-hidden issues */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: drawerWidth,
            height: '100vh',
            backgroundColor: 'background.paper',
            transform: sidebarOpen ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
            transition: 'transform 0.3s ease-in-out',
            zIndex: 1200,
            display: { xs: 'block', sm: 'none' },
            boxShadow: sidebarOpen ? 4 : 0,
          }}
        >
          <Toolbar />
          <Divider />
          <List>
            <ListItem button component={Link} to="/dashboard" onClick={() => dispatch(setSidebarOpen(false))}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/tickets" onClick={() => dispatch(setSidebarOpen(false))}>
              <ListItemIcon><TicketIcon /></ListItemIcon>
              <ListItemText primary="My Tickets" />
            </ListItem>
            <ListItem button component={Link} to="/tickets/new" onClick={() => dispatch(setSidebarOpen(false))}>
              <ListItemIcon><TicketIcon /></ListItemIcon>
              <ListItemText primary="New Ticket" />
            </ListItem>
            <ListItem button component={Link} to="/knowledgebase" onClick={() => dispatch(setSidebarOpen(false))}>
              <ListItemIcon><ArticleIcon /></ListItemIcon>
              <ListItemText primary="Knowledge Base" />
            </ListItem>
            {(user?.role === 'staff' || user?.role === 'faculty' || user?.role === 'admin') && (
              <ListItem button component={Link} to="/reports" onClick={() => dispatch(setSidebarOpen(false))}>
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Reports" />
              </ListItem>
            )}
            {user?.role === 'admin' && (
              <ListItem button component={Link} to="/admin" onClick={() => dispatch(setSidebarOpen(false))}>
                <ListItemIcon><AdminIcon /></ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItem>
            )}
          </List>
        </Box>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <Box
            onClick={() => dispatch(setSidebarOpen(false))}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1199,
              display: { xs: 'block', sm: 'none' },
            }}
          />
        )}
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            display: { xs: 'none', sm: 'block' },
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
              <ListItemText primary="My Tickets" />
            </ListItem>
            <ListItem button component={Link} to="/tickets/new">
              <ListItemIcon><TicketIcon /></ListItemIcon>
              <ListItemText primary="New Ticket" />
            </ListItem>
            <ListItem button component={Link} to="/knowledgebase">
              <ListItemIcon><ArticleIcon /></ListItemIcon>
              <ListItemText primary="Knowledge Base" />
            </ListItem>
            {(user?.role === 'staff' || user?.role === 'faculty' || user?.role === 'admin') && (
              <ListItem button component={Link} to="/reports">
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Reports" />
              </ListItem>
            )}
            {user?.role === 'admin' && (
              <ListItem button component={Link} to="/admin">
                <ListItemIcon><AdminIcon /></ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItem>
            )}
          </List>
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '64px', sm: '72px' },
          minHeight: '100vh',
          background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.8) 30%)',
          overflow: 'auto',
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
