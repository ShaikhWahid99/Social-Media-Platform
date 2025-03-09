// components/Profile.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostItem from "./PostItem";

function Profile({ isAuthenticated, currentUser }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Fetch profile data
    fetch(
      `https://codealpha-social-media-platform.onrender.com/api/users/${id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setProfile(data);

        // Check if current user is following this profile
        if (isAuthenticated && currentUser) {
          setIsFollowing(currentUser.following.includes(id));
        }

        // Fetch user's posts
        return fetch(
          `https://codealpha-social-media-platform.onrender.com/api/posts/user/${id}`
        );
      })
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });
  }, [id, isAuthenticated, currentUser]);

  const handleFollow = () => {
    if (!isAuthenticated) {
      alert("Please log in to follow users");
      return;
    }

    const token = localStorage.getItem("token");
    fetch(
      `https://codealpha-social-media-platform.onrender.com/api/users/${id}/follow`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setIsFollowing(!isFollowing);
        setProfile({
          ...profile,
          followers: data.followers,
        });
      })
      .catch((error) => console.error("Error following user:", error));
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <img
          src={
            profile.avatar
              ? `https://codealpha-social-media-platform.onrender.com${profile.avatar}`
              : "/default-avatar.png"
          }
          alt={profile.username}
          className="avatar-large"
        />
        <div className="profile-info">
          <h2>{profile.username}</h2>
          <p className="bio">{profile.bio || "No bio yet"}</p>
          <div className="profile-stats">
            <span>{posts.length} Posts</span>
            <span>{profile.followers.length} Followers</span>
            <span>{profile.following.length} Following</span>
          </div>

          {isAuthenticated && currentUser && currentUser.id !== id && (
            <button
              className={`follow-button ${isFollowing ? "following" : ""}`}
              onClick={handleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <div className="profile-posts">
        <h3>Posts</h3>
        {posts.length === 0 ? (
          <p>No posts yet</p>
        ) : (
          <div className="posts-container">
            {posts.map((post) => (
              <PostItem
                key={post._id}
                post={post}
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
