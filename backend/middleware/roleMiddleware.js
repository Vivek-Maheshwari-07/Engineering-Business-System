const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, message: 'Not authorized, no user role found' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.warn(`[ACCESS DENIED] User ${req.user.email} with role '${req.user.role}' attempted to access a protected route requiring: ${allowedRoles.join(', ')}`);
            return res.status(403).json({ success: false, message: 'Access Denied: You do not have permission to access this resource.' });
        }

        // Proceed if user's role is within allowed roles
        next();
    };
};

module.exports = { checkRole };
