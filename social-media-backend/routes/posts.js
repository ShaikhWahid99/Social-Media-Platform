const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    res.json(posts);
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { content, image } = req.body;

    const newPost = new Post({
      content,
      author: req.user.id,
      image: image || "",
    });

    const post = await newPost.save();
    const populatedPost = await Post.findById(post._id)
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    res.json(populatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { content, image } = req.body;

    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    post.content = content;
    if (image !== undefined) post.image = image;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");

    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === req.user.id);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json({ likes: post.likes });
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = {
      content,
      author: req.user.id,
    };

    post.comments.unshift(newComment);

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "comments.author",
      "username avatar"
    );

    res.json({ comments: updatedPost.comments });
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id/comment/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (
      comment.author.toString() !== req.user.id &&
      post.author.toString() !== req.user.id
    ) {
      return res.status(401).json({ error: "Not authorized" });
    }

    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );

    await post.save();

    res.json({ comments: post.comments });
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ error: "Post or comment not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
