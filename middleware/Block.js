const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization;

    // Check if token is present
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token.split(" ")[1], "secret_key");

    // Get user ID from decoded token
    const userId = decoded.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is blocked
    if (user.blocked) {
      return res
        .status(403)
        .json({ message: "Access denied: User is blocked" });
    }

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
