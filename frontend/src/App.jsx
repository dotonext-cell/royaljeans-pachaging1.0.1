import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import './index.css';

// Layout
import Layout from './components/layout/Layout';

// Auth
import Login from './pages/auth/Login';

// Main Pages
import Dashboard    from './pages/dashboard/Dashboard';
import OrdersList   from './pages/orders/OrdersList';
import OrderCreate  from './pages/orders/OrderCreate';
import OrderDetails from './pages/orders/OrderDetails';
import OrderEdit    from './pages/orders/OrderEdit';
import ProductsPage   from './pages/products/ProductsPage';
import WorkflowPage   from './pages/workflow/WorkflowPage';
import InventoryPage  from './pages/inventory/InventoryPage';
import FinancePage    from './pages/finance/FinancePage';
import ContractorsList from './pages/contractors/ContractorsList';
import ContractorCreate from './pages/contractors/ContractorCreate';
import Reports        from './pages/reports/Reports';
import AdminPanel     from './pages/admin/AdminPanel';
import UserManagement from './pages/admin/UserManagement';
import ProfilePage    from './pages/profile/ProfilePage';

// ─── ROUTE GUARDS ───
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminOnly = ({ children }) => {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN' ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Under-development placeholder
const ComingSoon = ({ title }) => (
  <div className="card animate-fadeUp" style={{ padding: 60, textAlign: 'center' }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
    <div className="text-primary font-bold" style={{ fontSize: 18 }}>{title || 'در دست توسعه'}</div>
    <div className="text-muted text-sm" style={{ marginTop: 8 }}>این بخش به زودی آماده خواهد شد</div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected — wrapped in Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Orders */}
          <Route path="orders"          element={<OrdersList />} />
          <Route path="orders/new"      element={<OrderCreate />} />
          <Route path="orders/:id"      element={<OrderDetails />} />
          <Route path="orders/:id/edit" element={<OrderEdit />} />

          {/* Products */}
          <Route path="products" element={<ProductsPage />} />

          {/* Workflow */}
          <Route path="workflow"     element={<WorkflowPage />} />
          <Route path="workflow/:id" element={<WorkflowPage />} />

          {/* Inventory */}
          <Route path="inventory" element={<InventoryPage />} />

          {/* Finance */}
          <Route path="finance" element={<FinancePage />} />

          {/* Contractors */}
          <Route path="contractors"     element={<ContractorsList />} />
          <Route path="contractors/new" element={<ContractorCreate />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />

          {/* Profile */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route path="admin" element={<AdminPanel />} />
          <Route
            path="admin/users"
            element={
              <AdminOnly>
                <UserManagement />
              </AdminOnly>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
