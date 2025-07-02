import React from "react";

export function StatItem({
  label,
  value,
  colorClass = "text-slate-900",
  flash,
}) {
  return (
    <div
      className={`flex justify-between items-baseline p-1 rounded-md ${
        flash ? "flash-update" : ""
      }`}
    >
      <span className="text-slate-600">{label}:</span>
      <span className={`text-xl font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}
