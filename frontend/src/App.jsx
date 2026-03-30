import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';

// Dashboards
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// Feature Pages
import EmployeeManagement from './pages/EmployeeManagement';
import InventoryManagement from './pages/InventoryManagement';
import BillingManagement from './pages/BillingManagement';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import MyOrders from './pages/MyOrders';
import AdminOrders from './pages/AdminOrders';
import MyInvoices from './pages/MyInvoices';

const App = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />

                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Protected Dashboard Routes nested inside Layout */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<DashboardLayout />}>
                                {/* Admin */}
                                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                    <Route path="/admin/employees" element={<EmployeeManagement />} />
                                    <Route path="/admin/inventory" element={<InventoryManagement />} />
                                    <Route path="/admin/orders" element={<AdminOrders />} />
                                    <Route path="/admin/billing" element={<BillingManagement />} />
                                    <Route path="/admin/settings" element={<Settings />} />
                                </Route>

                                {/* Employee */}
                                <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                                    <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                                    <Route path="/employee/inventory" element={<InventoryManagement />} />
                                    <Route path="/employee/tasks" element={<Tasks />} />
                                    <Route path="/employee/settings" element={<Settings />} />
                                </Route>

                                {/* Customer */}
                                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                                    <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                                    <Route path="/customer/orders" element={<MyOrders />} />
                                    <Route path="/customer/invoices" element={<MyInvoices />} />
                                    <Route path="/customer/settings" element={<Settings />} />
                                </Route>

                                {/* Fallback for unauthorized/placeholder */}
                                <Route 
                                    path="/unauthorized" 
                                    element={
                                        <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100 mt-12 mx-4">
                                            <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
                                            <p className="mt-2 text-slate-600">You do not have permission to view this section of the system.</p>
                                        </div>
                                    } 
                                />
                            </Route>
                        </Route>

                        {/* Catch all unmapped routes */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
};

export default App;
