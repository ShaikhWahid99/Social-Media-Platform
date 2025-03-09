// App.js - Main React component
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Profile from "./components/Profile";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import CreatePost from "./components/CreatePost";
import PostDetails from "./components/PostDetails";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      fetch(
        "https://codealpha-social-media-platform.onrender.com/api/auth/validate",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.valid) {
            setIsAuthenticated(true);
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
          }
        })
        .catch((error) => {
          console.error("Error validating token:", error);
          localStorage.removeItem("token");
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="logo">LinkUp</div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to={`/profile/${user?.id}`}>My Profile</Link>
                <Link to="/create-post">Create Post</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={<Home isAuthenticated={isAuthenticated} user={user} />}
            />
            <Route
              path="/profile/:id"
              element={
                <Profile isAuthenticated={isAuthenticated} currentUser={user} />
              }
            />
            <Route
              path="/signup"
              element={
                <SignUp
                  setIsAuthenticated={setIsAuthenticated}
                  setUser={setUser}
                />
              }
            />
            <Route
              path="/login"
              element={
                <Login
                  setIsAuthenticated={setIsAuthenticated}
                  setUser={setUser}
                />
              }
            />
            <Route
              path="/create-post"
              element={
                <CreatePost user={user} isAuthenticated={isAuthenticated} />
              }
            />
            <Route
              path="/post/:id"
              element={
                <PostDetails isAuthenticated={isAuthenticated} user={user} />
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>
            © 2025 SocialApp - Connect with friends and the world around you.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
