// middleware/auth.js - Authentication middleware
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer TOKEN

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "socialmediasecret"
    );

    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};
