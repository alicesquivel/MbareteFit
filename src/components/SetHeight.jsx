import React, { useState, useEffect } from "react";
import { db, auth } from "../utils/firebase";
import { ref, set, get } from "firebase/database";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

const SetHeight = () => {
  const [height, setHeightState] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        const heightRef = ref(db, `users/${currentUser.uid}/profile/height`);
        get(heightRef).then((snapshot) => {
          if (snapshot.exists()) {
            setHeightState(snapshot.val());
          }
        });
      } else {
        signInAnonymously(auth);
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setStatus("You must be logged in.");
      return;
    }
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum <= 0) {
      setStatus("Please enter a valid height.");
      return;
    }
    const heightRef = ref(db, `users/${user.uid}/profile/height`);
    await set(heightRef, heightNum);
    setStatus("Height saved!");
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "2rem 0" }}>
      <label>
        Set your height (in meters):&nbsp;
        <input
          type="number"
          step="0.01"
          value={height}
          onChange={(e) => setHeightState(e.target.value)}
          disabled={authLoading || !user}
        />
      </label>
      <button type="submit" style={{ marginLeft: 8 }} disabled={authLoading || !user}>
        Save Height
      </button>
      <div style={{ marginTop: 8, color: user ? "green" : "red" }}>
        {authLoading ? "Loading user..." : status}
      </div>
    </form>
  );
};

export default SetHeight;