// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Checks if request has a valid JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']; // expects: "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // get just the token part after "Bearer"

  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info (userId, role) to the request
    next(); // token valid, continue to the actual route
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Checks if the logged-in user is an admin (use AFTER verifyToken)
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
}

module.exports = { verifyToken, isAdmin };