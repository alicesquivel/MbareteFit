import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

// Import your components
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

// Import main styles
import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe(); // Unsubscribe on cleanup
  }, [auth]);

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  // If a user is logged in, show the Dashboard. Otherwise, show the Login page.
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
