const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -email")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    const updateFields = {};

    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/follow", auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = user.following.some(
      (id) => id.toString() === req.params.id
    );

    if (isFollowing) {
      user.following = user.following.filter(
        (id) => id.toString() !== req.params.id
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      user.following.push(req.params.id);
      targetUser.followers.push(req.user.id);
    }

    await user.save();
    await targetUser.save();

    res.json({
      followers: targetUser.followers,
      following: user.following,
    });
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
