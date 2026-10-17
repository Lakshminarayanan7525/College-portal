/**
 * User Permission Middleware (Role-Based Access Control)
 * Ensures the authenticated user possesses the required role/permissions to access the endpoint.
 *
 * @param  {...string} allowedRoles - List of allowed roles (e.g. 'Teacher', 'Student')
 */
const permissionMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.'
      });
    }

    // Normalize comparison to be case-insensitive and robust
    const userRole = (req.user.role || '').toLowerCase();
    const hasPermission = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User with role '${req.user.role}' is not permitted to access this resource. Required role(s): [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};

module.exports = permissionMiddleware;
