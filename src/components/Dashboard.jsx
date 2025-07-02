import React, { useState, useEffect, useCallback } from "react";
// Import the initialized 'db' instance from your config file
import { db } from "../firebase-config.js";
// Import the database functions you need
import { ref, onValue, set } from "firebase/database";

// Import your new, smaller components
import StatsPanel from "./StatsPanel";
import WeightLogForm from "./WeightLogForm";
import ProgressChart from "./ProgressChart";
import HistoryTable from "./HistoryTable";

export default function Dashboard({ user }) {
  const [weightData, setWeightData] = useState([]);
  const [goalWeight, setGoalWeight] = useState(null);
  const [height, setHeight] = useState(null);
  const [units, setUnits] = useState("kg");

  const saveData = useCallback(
    (dataToSave) => {
      // Use the imported 'db' instance directly
      const userRef = ref(db, `users/${user.uid}`);
      set(userRef, dataToSave);
    },
    [user.uid]
  );

  useEffect(() => {
    // Use the imported 'db' instance directly
    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setWeightData(data.weightData || []);
        setGoalWeight(data.goalWeight || null);
        setHeight(data.height || null);
        setUnits(data.units || "kg");
      }
    });
    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    // The saveData function depends on user.uid, which is stable,
    // so we can include it to satisfy the exhaustive-deps rule.
    saveData({ weightData, goalWeight, height, units });
  }, [weightData, goalWeight, height, units, saveData]);

  return (
    <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-8">
        <WeightLogForm
          units={units}
          setWeightData={setWeightData}
          goalWeight={goalWeight}
        />
        <StatsPanel
          weightData={weightData}
          goalWeight={goalWeight}
          height={height}
          units={units}
          setGoalWeight={setGoalWeight}
          setHeight={setHeight}
        />
      </div>
      <div className="lg:col-span-2 space-y-8">
        <ProgressChart
          weightData={weightData}
          units={units}
          goalWeight={goalWeight}
        />
        <HistoryTable
          weightData={weightData}
          units={units}
          setWeightData={setWeightData}
        />
      </div>
    </main>
  );
}
