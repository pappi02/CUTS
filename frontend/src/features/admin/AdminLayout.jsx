import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  useTheme
} from '@mui/material';
import {
  School as SchoolIcon,
  Business as DepartmentIcon,
  Category as CategoryIcon,
  Group as GroupIcon,
  Rule as RuleIcon,
  People as UsersIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import Schools from './Schools';
import Departments from './Departments';
import Categories from './Categories';
import AssignmentGroups from './AssignmentGroups';
import Rules from './Rules';
import AdminDashboard from './AdminDashboard';
import { useEffect } from 'react';

const drawerWidth = 240;

const AdminLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/schools');
  }, [navigate]);

  const menuItems = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/admin' },
    { text: 'Schools', icon: SchoolIcon, path: '/admin/schools' },
    { text: 'Departments', icon: DepartmentIcon, path: '/admin/departments' },
    { text: 'Categories', icon: CategoryIcon, path: '/admin/categories' },
    { text: 'Assignment Groups', icon: GroupIcon, path: '/admin/groups' },
    { text: 'Rules', icon: RuleIcon, path: '/admin/rules' },
    { text: 'Users', icon: UsersIcon, path: '/admin/users' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          ['& .MuiDrawer-paper']: { width: drawerWidth, boxSizing: 'border-box' },
        }}
        open
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.path}>
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        <Toolbar />
        {/* Only use Routes; no nested Router */}
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="schools" element={<Schools />} />
          <Route path="departments" element={<Departments />} />
          <Route path="categories" element={<Categories />} />
          <Route path="groups" element={<AssignmentGroups />} />
          <Route path="rules" element={<Rules />} />
          <Route path="users" element={<AdminDashboard />} /> {/* Replace with Users component if needed */}
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminLayout;