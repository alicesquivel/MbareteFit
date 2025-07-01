import React from "react";
import SetHeight from "../components/SetHeight";

const Dashboard = () => (
  <div className="dashboard-container">
    <header>
      <h1>MbareteFit</h1>
      <p>Your comprehensive tool for tracking weight, BMI, and progress.</p>
    </header>
    <main>
      <section>
        <SetHeight />
      </section>
    </main>
  </div>
);

export default Dashboard;