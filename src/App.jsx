// src/App.jsx

import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  getRedirectResult,
} from "firebase/auth";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    // This function will check for a returning user from a redirect
    const checkRedirect = async () => {
      try {
        // First, wait for the redirect result to be processed
        // This ensures the session is updated before the listener runs
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Error processing redirect:", error);
      }

      // After processing the redirect, the listener will have the correct user state
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        // We can now safely say the initial loading is complete
        setLoading(false);
      });

      // Return the cleanup function for the listener
      return unsubscribe;
    };

    checkRedirect();
  }, [auth]);

  const handleSignOut = () => {
    signOut(auth);
  };

  // Show a loading indicator while we check for the user
  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      {user ? (
        <>
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">MbareteFit</h1>
            <div>
              <span className="mr-4">Welcome, {user.displayName}!</span>
              <button
                onClick={handleSignOut}
                className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          </header>
          <Dashboard user={user} />
        </>
      ) : (
        <Login />
      )}
    </div>
  );
}
