// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
const id = decoded.userId || decoded.id;
req.user = { id, email: decoded.email, iat: decoded.iat, exp: decoded.exp };

    next();
  } catch (err) {
    console.error("⚠️ authMiddleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
