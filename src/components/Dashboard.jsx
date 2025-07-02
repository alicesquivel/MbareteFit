import React, { useState, useEffect, useCallback } from "react";
import { getDatabase, ref, onValue, set } from "firebase/database";

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

  // Memoized save function to avoid re-creating it on every render
  const saveData = useCallback(
    (dataToSave) => {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      set(userRef, dataToSave);
    },
    [user.uid]
  );

  // Effect to load data from Firebase when the component mounts
  useEffect(() => {
    const db = getDatabase();
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

  // Effect to save data whenever it changes
  useEffect(() => {
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
