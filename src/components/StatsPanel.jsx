import React, { useMemo, useState } from "react";
import { StatItem } from "./StatItem";
import { Modal } from "./Modal";
import {
  formatWeight,
  calculateBMI,
  getBmiColor,
  convertToKg,
} from "../utils/helpers";

export default function StatsPanel({
  weightData,
  goalWeight,
  height,
  units,
  setGoalWeight,
  setHeight,
}) {
  // State for managing modals and their inputs
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isHeightModalOpen, setHeightModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [flash, setFlash] = useState(false);

  // This logic calculates all your stats. It's moved directly from your original file.
  const stats = useMemo(() => {
    if (weightData.length === 0) return {};
    const sorted = [...weightData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const latest = sorted[sorted.length - 1];
    const change = latest.weight - sorted[0].weight;
    const bmi = calculateBMI(latest.weight, height);
    const allWeights = sorted.map((d) => d.weight);

    let progress = null;
    if (goalWeight && sorted.length > 0) {
      const start = sorted[0].weight;
      const totalDistance = Math.abs(start - goalWeight);
      progress =
        totalDistance > 0
          ? ((start - latest.weight) / (start - goalWeight)) * 100
          : latest.weight <= goalWeight
          ? 100
          : 0;
      progress = Math.max(0, Math.min(100, progress));
    }

    // Trigger a flash animation when the current weight changes
    setFlash(true);
    setTimeout(() => setFlash(false), 800);

    return {
      current: latest.weight,
      goal: goalWeight,
      change,
      bmi,
      lowest: Math.min(...allWeights),
      highest: Math.max(...allWeights),
      progress,
    };
  }, [weightData, goalWeight, height]);

  const handleSetGoal = () => {
    const val = parseFloat(goalInput);
    if (!val || val <= 0) return;
    setGoalWeight(convertToKg(val, units));
    setGoalModalOpen(false);
  };

  const handleSetHeight = () => {
    const val = parseFloat(heightInput);
    if (!val || val <= 0) return;
    setHeight(val / 100); // Assuming height is entered in cm
    setHeightModalOpen(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="space-y-3 text-sm">
          <StatItem
            label="Progress to Goal"
            value={
              stats.progress != null ? `${stats.progress.toFixed(0)}%` : "--"
            }
            flash={flash}
          />
          <StatItem
            label="Current"
            value={formatWeight(stats.current, units)}
            flash={flash}
          />
          <StatItem
            label="Goal"
            value={formatWeight(stats.goal, units)}
            colorClass="text-blue-600"
          />
          <StatItem
            label="Change"
            value={formatWeight(stats.change, units)}
            colorClass={stats.change > 0 ? "text-red-600" : "text-green-600"}
            flash={flash}
          />
          <hr className="my-2" />
          <StatItem
            label="BMI"
            value={stats.bmi}
            colorClass={getBmiColor(stats.bmi)}
            flash={flash}
          />
          <StatItem label="Lowest" value={formatWeight(stats.lowest, units)} />
          <StatItem
            label="Highest"
            value={formatWeight(stats.highest, units)}
          />
          <div className="grid grid-cols-2 gap-2 pt-4">
            <button
              onClick={() => setGoalModalOpen(true)}
              className="w-full bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg"
            >
              Goal
            </button>
            <button
              onClick={() => setHeightModalOpen(true)}
              className="w-full bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg"
            >
              Height
            </button>
          </div>
        </div>
      </div>

      {/* Modals for setting Goal and Height */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Set Goal Weight ({units})</h2>
        <input
          type="number"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="Enter goal weight"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSetGoal}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Set Goal
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isHeightModalOpen}
        onClose={() => setHeightModalOpen(false)}
      >
        <h2 className="text-2xl font-bold mb-4">Set Your Height (cm)</h2>
        <input
          type="number"
          value={heightInput}
          onChange={(e) => setHeightInput(e.target.value)}
          placeholder="Enter height in cm"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSetHeight}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Set Height
          </button>
        </div>
      </Modal>
    </>
  );
}
