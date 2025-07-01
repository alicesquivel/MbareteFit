import React from "react";
import WeightForm from "../components/WeightForm";
import WeightHistory from "../components/WeightHistory";
import WeightChart from "../components/WeightChart";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";

const Dashboard = ({ user, weights }) => (
  <div className="dashboard-outer">
    <div className="dashboard-card">
      <div className="dashboard-header">
        <h1>
          <span role="img" aria-label="dumbbell" className="dashboard-logo">🏋️‍♂️</span>
          MbareteFit
        </h1>
        <button className="logout-btn" onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>
      <WeightForm />
      <WeightHistory weights={weights} />
    </div>
    <div className="dashboard-chart-card">
      <WeightChart weights={weights} />
    </div>
  </div>
);

export default Dashboard;