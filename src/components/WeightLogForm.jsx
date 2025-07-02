import React, { useState } from "react";
import { convertToKg } from "../utils/helpers";
import confetti from "canvas-confetti";

export default function WeightLogForm({ units, setWeightData, goalWeight }) {
  const [weightInput, setWeightInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const handleLogWeight = () => {
    if (!weightInput) return;
    const weightVal = parseFloat(weightInput);
    if (!weightVal || weightVal <= 0) {
      alert("Please enter a valid weight.");
      return;
    }

    const weightInKg = convertToKg(weightVal, units);

    // Update the parent component's state
    setWeightData((prevData) => {
      const previousLowest =
        prevData.length > 0
          ? Math.min(...prevData.map((d) => d.weight))
          : Infinity;

      // Trigger confetti if the goal is met or a new low is achieved
      if (goalWeight && weightInKg <= goalWeight) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      } else if (weightInKg < previousLowest) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
      }

      return [
        ...prevData,
        {
          id: Date.now(),
          date: new Date().toISOString(),
          weight: weightInKg,
          note: notesInput.trim(),
        },
      ];
    });

    // Clear the form fields
    setWeightInput("");
    setNotesInput("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Log New Entry</h2>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="number"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="Enter weight"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {units}
          </span>
        </div>
        <textarea
          value={notesInput}
          onChange={(e) => setNotesInput(e.target.value)}
          placeholder="Add a note (optional)"
          rows="2"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg"
        ></textarea>
        <button
          onClick={handleLogWeight}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Log Weight
        </button>
      </div>
    </div>
  );
}
