import React, { useEffect, useState } from "react";
import { auth, db } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import "./styles/App.css";

function App() {
  const [user, setUser] = useState(null);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Subscribe to weights data
        const weightsRef = ref(db, `users/${currentUser.uid}/weights`);
        const unsubWeights = onValue(weightsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const weightsList = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value
            }));
            setWeights(weightsList);
          } else {
            setWeights([]);
          }
          setLoading(false);
        });

        return () => unsubWeights();
      } else {
        setWeights([]);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      {user ? <Dashboard user={user} weights={weights} /> : <Login />}
    </div>
  );
}

export default App;