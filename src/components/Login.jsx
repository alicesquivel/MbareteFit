// src/components/Login.jsx
import React from "react";
import { auth } from "../firebase-config.js";
// Import signInWithRedirect instead of signInWithPopup
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

const Login = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Call signInWithRedirect
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome to MbareteFit</h1>
      <p>Your comprehensive tool for tracking weight, BMI, and progress.</p>
      <button onClick={handleGoogleSignIn} className="google-signin-btn">
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
