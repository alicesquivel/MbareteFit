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
    // This is the ideal pattern for handling redirect flows.
    // The onAuthStateChanged listener is the single source of truth for the user's state.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Once we get the first response from this listener, we know the initial auth check is complete.
      setLoading(false);
    });

    // Separately, process any redirect results. This doesn't need to be waited on,
    // as onAuthStateChanged will fire with the user once the session is established.
    getRedirectResult(auth).catch((error) => {
      console.error("Error processing redirect result:", error);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [auth]);

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
