import React, { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SetHeight from "../components/SetHeight";
import Login from "../components/Login";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  return (
    <div className="dashboard-container">
      <header>
        <h1>MbareteFit</h1>
        <p>Your comprehensive tool for tracking weight, BMI, and progress.</p>
        {user && (
          <button onClick={() => signOut(auth)} style={{ float: "right" }}>Sign Out</button>
        )}
      </header>
      <main>
        {!user ? (
          <Login />
        ) : (
          <SetHeight />
        )}
      </main>
    </div>
  );
};

export default Dashboard;