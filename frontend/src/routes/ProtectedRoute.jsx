import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { token, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If allowedRoles is specified, test against user role
    // user could be null initially if verify route fails, but token exists.
    // Ideally user is loaded from token on mount in AuthContext.
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Not authorized for this role context
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
