import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  const auth = getAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider(); // Create a new Google Auth provider
    try {
      // Trigger the Google Sign-In popup
      const result = await signInWithPopup(auth, provider);

      // The signed-in user info can be accessed via result.user
      const user = result.user;
      console.log("Signed in as:", user.displayName);
    } catch (error) {
      // Handle Errors here.
      console.error("Error during sign-in:", error.message);
    }
  };

  return (
    <div>
      <h2>Please Sign In</h2>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
};

export default Login;
