import React from "react";
// Correctly imports the already initialized service
import { auth } from "../firebase-config.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  // const auth = getAuth(); // THIS LINE HAS BEEN REMOVED

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // This 'auth' variable now correctly refers to the one you imported
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
