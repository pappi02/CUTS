import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';
import AppLayout from './components/AppLayout';
import ScrollRestoration from './components/ScrollRestoration';
import ScrollToTop from './components/ScrollToTop';
import AdminLayout from './features/admin/AdminLayout';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import StudentDashboard from './features/dashboard/StudentDashboard';
import StaffDashboard from './features/dashboard/StaffDashboard';
import AdminOverviewDashboard from './features/dashboard/AdminOverviewDashboard';
import TicketList from './features/tickets/TicketList';
import TicketDetail from './features/tickets/TicketDetail';
import TicketCreate from './features/tickets/TicketCreate';
import KnowledgeBase from './features/knowledgebase/KnowledgeBase';
import KnowledgeBaseArticle from './features/knowledgebase/KnowledgeBaseArticle';
import KnowledgeBaseEditor from './features/knowledgebase/KnowledgeBaseEditor';
import Reports from './features/reports/Reports';
import Profile from './features/profile/Profile';
import { updateActivity, selectUser, setUser, clearUser } from './store/slices/authSlice';
import { fetchProfile } from './services/auth';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    // Check if user is persisted and verify with server
    const persistedUser = localStorage.getItem('user');
    if (persistedUser && !user) {
      fetchProfile()
        .then(response => {
          dispatch(setUser(response.data));
        })
        .catch(() => {
          dispatch(clearUser());
        });
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      dispatch(updateActivity());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, dispatch]);

  return (
    <ScrollRestoration>
      <ScrollToTop />
      <Routes>
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/student-dashboard"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['student']}>
              <AppLayout>
                <StudentDashboard />
              </AppLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/staff-dashboard"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['staff', 'faculty']}>
              <AppLayout>
                <StaffDashboard />
              </AppLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['admin']}>
              <AppLayout>
                <AdminOverviewDashboard />
              </AppLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* Tickets */}
      <Route
        path="/tickets"
        element={
          <AuthGuard>
            <AppLayout>
              <TicketList />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <AuthGuard>
            <AppLayout>
              <TicketCreate />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <AuthGuard>
            <AppLayout>
              <TicketDetail />
            </AppLayout>
          </AuthGuard>
        }
      />

      {/* KnowledgeBase */}
      <Route
        path="/knowledgebase"
        element={
          <AuthGuard>
            <AppLayout>
              <KnowledgeBase />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/knowledgebase/:id"
        element={
          <AuthGuard>
            <AppLayout>
              <KnowledgeBaseArticle />
            </AppLayout>
          </AuthGuard>
        }
      />
      <Route
        path="/knowledgebase/new"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['admin', 'staff', 'faculty']}>
              <AppLayout>
                <KnowledgeBaseEditor />
              </AppLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="/knowledgebase/:id/edit"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['admin', 'staff', 'faculty']}>
              <AppLayout>
                <KnowledgeBaseEditor />
              </AppLayout>
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <AuthGuard>
            <AppLayout>
              <Reports />
            </AppLayout>
          </AuthGuard>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <AppLayout>
              <Profile />
            </AppLayout>
          </AuthGuard>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={['admin']}>
              <AdminLayout />
            </RoleGuard>
          </AuthGuard>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </ScrollRestoration>
  );
}

export default App;

