import React from "react";
import { format } from "date-fns";

const WeightHistory = ({ weights = [] }) => {
  const sortedWeights = [...weights].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="weight-history">
      <h2>History</h2>
      <div className="weight-list">
        {sortedWeights.map((entry, index) => (
          <div key={index} className="weight-entry">
            <span className="weight-date">
              {format(new Date(entry.date), "MMM d, yyyy")}
            </span>
            <span className="weight-value">
              {entry.weight} kg
            </span>
          </div>
        ))}
        {sortedWeights.length === 0 && (
          <p className="no-weights">No weight entries yet</p>
        )}
      </div>
    </div>
  );
};

export default WeightHistory;