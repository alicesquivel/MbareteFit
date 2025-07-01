import React, { useState } from "react";
import { db, auth } from "../utils/firebase";
import { ref, push, serverTimestamp } from "firebase/database";

const WeightForm = () => {
  const [weight, setWeight] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    if (!user) {
      setStatus("You must be logged in");
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setStatus("Please enter a valid weight");
      return;
    }

    try {
      const weightsRef = ref(db, `users/${user.uid}/weights`);
      await push(weightsRef, {
        weight: weightNum,
        timestamp: serverTimestamp(),
        date: new Date().toISOString()
      });
      setWeight("");
      setStatus("Weight logged successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      setStatus("Error saving weight: " + error.message);
    }
  };

  return (
    <div className="weight-form-container">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            id="weight"
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter your weight"
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Log Weight
        </button>
      </form>
      {status && (
        <p className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
          {status}
        </p>
      )}
    </div>
  );
};

export default WeightForm;