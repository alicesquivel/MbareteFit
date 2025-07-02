// src/App.jsx
import React, { useState, useEffect } from "react";
// Add getRedirectResult to your imports
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
    // This function checks if the user is coming back from a redirect
    getRedirectResult(auth)
      .then((result) => {
        // If result is not null, the user has just signed in.
        // onAuthStateChanged will handle setting the user state.
        if (result) {
          console.log("Redirect sign-in successful");
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      })
      .finally(() => {
        // This listener will handle setting the user state on initial load AND after redirect.
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
        return () => unsubscribe();
      });
  }, [auth]);

  // ... The rest of your App.jsx component remains the same ...

  const handleSignOut = () => {
    signOut(auth);
  };

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
