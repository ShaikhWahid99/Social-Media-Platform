// components/CreatePost.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreatePost({ user, isAuthenticated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Post content cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");

    // In a real app, you'd use FormData to handle file uploads
    // This is simplified for demonstration
    const postData = {
      content,
      image: image || null,
    };

    fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error creating post:", error);
        setError("An error occurred while creating the post");
      });
  };

  return (
    <div className="create-post">
      <h2>Create New Post</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">What's on your mind?</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image URL (optional)</label>
          <input
            type="text"
            id="image"
            value={image || ""}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Enter image URL"
          />
        </div>
        <button type="submit" className="post-button">
          Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
