import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";

function PostItem({ post, isAuthenticated, currentUser }) {
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(
    isAuthenticated && post.likes.includes(currentUser?.id)
  );

  const handleLike = () => {
    if (!isAuthenticated) {
      alert("Please log in to like posts");
      return;
    }

    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setLikes(data.likes);
        setHasLiked(!hasLiked);
      })
      .catch((error) => console.error("Error liking post:", error));
  };

  return (
    <div className="post-item">
      <div className="post-header">
        <Link to={`/profile/${post.author._id}`} className="author-link">
          <img
            src={post.author.avatar || "/images/default-avatar.png"}
            alt={post.author.username}
            className="avatar-small"
          />
          <span className="username">{post.author.username}</span>
        </Link>
        <span className="post-date">
          {formatDistance(new Date(post.createdAt), new Date(), {
            addSuffix: true,
          })}
        </span>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="post-image" />
        )}
      </div>

      <div className="post-actions">
        <button
          className={`like-button ${hasLiked ? "liked" : ""}`}
          onClick={handleLike}
        >
          {hasLiked ? "Liked" : "Like"} ({likes.length})
        </button>
        <Link to={`/post/${post._id}`} className="comment-button">
          Comments ({post.comments.length})
        </Link>
      </div>
    </div>
  );
}

export default PostItem;
