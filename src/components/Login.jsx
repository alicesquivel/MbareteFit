// src/components/Login.jsx

import React from "react";
import { auth } from "../firebase-config.js";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

const Login = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold text-slate-900">MbareteFit</h1>
      <p className="text-slate-600 mt-2 mb-8">
        Your comprehensive tool for tracking weight, BMI, and progress.
      </p>
      {/* Add Tailwind CSS classes here for styling */}
      <button
        onClick={handleGoogleSignIn}
        className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
