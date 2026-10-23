
const express = require("express");
const jwt = require("jsonwebtoken");
const Post = require("../models/post");
const Comment = require("../models/comment");

const router = express.Router();

// ================= AUTHENTICATION =================

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// ================= CREATE POST =================

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: req.userId,
    });

    await post.populate("author", "name email");

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create Post Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= GET ALL POSTS =================

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Get Posts Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= GET COMMENTS FOR A POST =================

router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comments = await Comment.find({
      post: post._id,
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Get Comments Error:", error);

    res.status(500).json({
      message: "Unable to load comments",
    });
  }
});

// ================= ADD COMMENT =================

router.post("/:id/comments", authenticateUser, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({
        message: "Comment cannot exceed 1000 characters",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      text: text.trim(),
      author: req.userId,
      post: post._id,
    });

    await comment.populate("author", "name email");

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);

    res.status(500).json({
      message: "Unable to add comment",
    });
  }
});

// ================= GET SINGLE POST =================

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Get Post Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= UPDATE POST =================

router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only edit your own posts",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Title cannot be empty",
        });
      }

      post.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          message: "Content cannot be empty",
        });
      }

      post.content = content.trim();
    }

    await post.save();
    await post.populate("author", "name email");

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update Post Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= DELETE POST =================

router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only delete your own posts",
      });
    }

    // Delete comments belonging to this post too.
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Post and its comments deleted successfully",
    });
  } catch (error) {
    console.error("Delete Post Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
