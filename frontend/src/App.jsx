import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';
import AppLayout from './components/AppLayout';
import ScrollRestoration from './components/ScrollRestoration';
import AdminLayout from './features/admin/AdminLayout';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import TicketList from './features/tickets/TicketList';
import TicketDetail from './features/tickets/TicketDetail';
import TicketCreate from './features/tickets/TicketCreate';
import KnowledgeBase from './features/knowledgebase/KnowledgeBase';
import KnowledgeBaseArticle from './features/knowledgebase/KnowledgeBaseArticle';
import KnowledgeBaseEditor from './features/knowledgebase/KnowledgeBaseEditor';
import Reports from './features/reports/Reports';
import Profile from './features/profile/Profile';

function App() {
  return (
    <ScrollRestoration>
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

