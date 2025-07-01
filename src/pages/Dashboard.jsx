import React from "react";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
import WeightForm from "../components/WeightForm";
import WeightHistory from "../components/WeightHistory";
import WeightChart from "../components/WeightChart";

const Dashboard = ({ user, weights }) => (
  <div className="dashboard-outer">
    <div className="dashboard-card">
      <div className="dashboard-header">
        <span className="logo">🏋️‍♀️</span>
        <h1>MbareteFit</h1>
        <button className="logout-btn" onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>
      <div className="divider" />
      <WeightForm />
      <div className="divider" />
      <WeightHistory weights={weights} />
    </div>
    <div className="dashboard-chart-card">
      <WeightChart weights={weights} />
    </div>
  </div>
);

export default Dashboard;