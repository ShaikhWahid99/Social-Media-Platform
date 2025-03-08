// components/SignUp.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp({ setIsAuthenticated, setUser }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          localStorage.setItem("token", data.token);
          setIsAuthenticated(true);
          setUser(data.user);
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        setError("An error occurred during sign up");
      });
  };

  return (
    <div className="auth-form">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        <button type="submit" className="auth-button">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUp;
