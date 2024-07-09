const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Check if Authorization header is present and starts with 'Bearer '
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization header is missing or invalid'
            });
        }

        // Extract token from Authorization header
        const token = req.headers.authorization.split(' ')[1];

        // Verify JWT token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Attach userId from token payload to req object for use in routes
        req.userId = decodedToken.userId;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        // Handle JWT verification errors
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};
