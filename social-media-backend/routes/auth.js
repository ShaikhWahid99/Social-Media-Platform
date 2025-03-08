// routes/auth.js - Authentication routes
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Register a new user
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "socialmediasecret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "socialmediasecret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Validate token and get user data
router.get("/validate", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ valid: false });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
