import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Unauthorized from './pages/Unauthorized';
import ProductList from './pages/products/ProductList';
import ProductDetails from './pages/products/ProductDetails';
import ProductAdd from './pages/products/ProductAdd';
import ProductEdit from './pages/products/ProductEdit';

import InventoryList from './pages/inventory/InventoryList';
import AddStock from './pages/inventory/AddStock';
import InventoryLogs from './pages/inventory/InventoryLogs';

import OrderList from './pages/orders/OrderList';
import CreateOrder from './pages/orders/CreateOrder';
import OrderDetails from './pages/orders/OrderDetails';

import InvoiceView from './pages/invoice/InvoiceView';

import ReportsDashboard from './pages/reports/ReportsDashboard';
import RevenueChart from './pages/reports/RevenueChart';
import TopProducts from './pages/reports/TopProducts';
import GSTReport from './pages/reports/GSTReport';
import InventoryReport from './pages/reports/InventoryReport';

import SalaryDashboard from './pages/salary/SalaryDashboard';
import MySalary from './pages/salary/MySalary';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes (No Sidebar/Layout bindings) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Master Dashboard Layout wrapper */}
          <Route element={<DashboardLayout />}>
            
            {/* Protected Routes (Authenticated System Users) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            {/* Global Catalog Level Tracking Routes */}
            <Route element={<ProtectedRoute allowedRoles={['owner', 'employee', 'customer']} />}>
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/invoice/:id" element={<InvoiceView />} />
            </Route>

            {/* Owner Specific Customizations */}
            <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
              <Route path="/users" element={<UserManagement />} />
              <Route path="/products/add" element={<ProductAdd />} />
              <Route path="/products/edit/:id" element={<ProductEdit />} />
            </Route>

            {/* Employee Specific Tracking Tools (Owner + Employee) */}
            <Route element={<ProtectedRoute allowedRoles={['owner', 'employee']} />}>
              <Route path="/inventory" element={<InventoryList />} />
              <Route path="/inventory/add" element={<AddStock />} />
              <Route path="/inventory/logs" element={<InventoryLogs />} />
            </Route>

            {/* Customer Log Routes */}
            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="/my-orders" element={<OrderList />} />
              <Route path="/create-order" element={<CreateOrder />} />
            </Route>

            {/* Reports & Analytics (Owner + Employee only) */}
            <Route element={<ProtectedRoute allowedRoles={['owner', 'employee']} />}>
              <Route path="/reports" element={<ReportsDashboard />} />
              <Route path="/reports/revenue" element={<RevenueChart />} />
              <Route path="/reports/top-products" element={<TopProducts />} />
              <Route path="/reports/gst" element={<GSTReport />} />
              <Route path="/reports/inventory" element={<InventoryReport />} />
            </Route>

            {/* Salary Management */}
            <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
              <Route path="/salary" element={<SalaryDashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
              <Route path="/my-salary" element={<MySalary />} />
            </Route>

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
