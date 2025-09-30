import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistance } from "date-fns";

function PostDetails({ isAuthenticated, user }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    fetch(
      `https://codealpha-social-media-platform.onrender.com/api/posts/${id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setPost(data);
        setLikes(data.likes);
        if (isAuthenticated && user) {
          setHasLiked(data.likes.includes(user.id));
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching post:", error);
        setError("Failed to load post details");
        setLoading(false);
      });
  }, [id, isAuthenticated, user]);

  const handleLike = () => {
    if (!isAuthenticated) {
      alert("Please log in to like posts");
      return;
    }

    const token = localStorage.getItem("token");
    fetch(
      `https://codealpha-social-media-platform.onrender.com/api/posts/${id}/like`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setLikes(data.likes);
        setHasLiked(!hasLiked);
      })
      .catch((error) => {
        console.error("Error liking post:", error);
      });
  };

  const handleComment = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please log in to comment");
      return;
    }

    if (!comment.trim()) {
      return;
    }

    const token = localStorage.getItem("token");
    fetch(
      `https://codealpha-social-media-platform.onrender.com/api/posts/${id}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setPost({
          ...post,
          comments: data.comments,
        });
        setComment("");
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      });
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error || !post) {
    return <div className="error">{error || "Post not found"}</div>;
  }

  return (
    <div className="post-details">
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
        <span>Comments ({post.comments.length})</span>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>

        {isAuthenticated ? (
          <form onSubmit={handleComment} className="comment-form">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button type="submit">Comment</button>
          </form>
        ) : (
          <p>
            <Link to="/login">Login</Link> to add a comment
          </p>
        )}

        <div className="comments-list">
          {post.comments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            post.comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment-header">
                  <Link
                    to={`/profile/${comment.author._id}`}
                    className="author-link"
                  >
                    <img
                      src={
                        comment.author.avatar || "/images/default-avatar.png"
                      }
                      alt={comment.author.username}
                      className="avatar-tiny"
                    />
                    <span className="username">{comment.author.username}</span>
                  </Link>
                  <span className="comment-date">
                    {formatDistance(new Date(comment.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetails;
