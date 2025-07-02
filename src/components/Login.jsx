import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  const auth = getAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error.message);
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
