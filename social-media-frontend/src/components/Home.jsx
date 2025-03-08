// components/Home.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PostItem from "./PostItem";

function Home({ isAuthenticated, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="home">
      <h2>Recent Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to share something!</p>
      ) : (
        <div className="posts-container">
          {posts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              isAuthenticated={isAuthenticated}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
