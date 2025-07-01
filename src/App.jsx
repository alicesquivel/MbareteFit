import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { firebaseConfig } from './firebase-config';

// Chart.js Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Other Imports
import confetti from 'canvas-confetti';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// --- Helper & Utility Functions ---
const KG_TO_LBS = 2.20462;

const convertToKg = (val, units) => (units === 'lbs' ? val / KG_TO_LBS : val);
const convertFromKg = (val, units) => (units === 'lbs' ? val * KG_TO_LBS : val);

const formatWeight = (val, units) =>
  typeof val === "number" && !isNaN(val)
    ? `${convertFromKg(val, units).toFixed(1)} ${units}`
    : "--";

const calculateBMI = (weightKg, heightM) =>
  (typeof weightKg === "number" && typeof heightM === "number" && weightKg > 0 && heightM > 0)
    ? (weightKg / (heightM * heightM)).toFixed(1)
    : '--';

const getBmiColor = (bmi) => {
  if (typeof bmi !== "number") return 'text-slate-900';
  if (bmi < 18.5) return 'text-blue-500';
  if (bmi < 25) return 'text-green-500';
  if (bmi < 30) return 'text-yellow-500';
  if (bmi < 35) return 'text-orange-500';
  return 'text-red-500';
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- React Components ---

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm m-4" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, colorClass = 'text-slate-900', flash }) => (
  <div className={`flex justify-between items-baseline p-1 rounded-md ${flash ? 'flash-update' : ''}`}>
    <span className="text-slate-600">{label}:</span>
    <span className={`text-xl font-bold ${colorClass}`}>{value}</span>
  </div>
);

export default function App() {
  // --- State Management ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);

  const [appData, setAppData] = useState({ profiles: {}, lastActiveProfile: null });
  const [activeProfile, setActiveProfile] = useState(null);

  // State for the active profile's data
  const [weightData, setWeightData] = useState([]);
  const [goalWeight, setGoalWeight] = useState(null);
  const [height, setHeight] = useState(null);
  const [units, setUnits] = useState('kg');

  // UI State
  const [isLocked, setIsLocked] = useState(true);
  const [modal, setModal] = useState(null); // 'profile', 'login', 'manage', 'goal', 'height', 'deleteEntry'
  const [flashStats, setFlashStats] = useState(false);

  // State for modals
  const [profileInput, setProfileInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [profileToLogin, setProfileToLogin] = useState(null);
  const [goalInput, setGoalInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [weightInput, setWeightInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // --- Firebase Initialization and Data Sync ---
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const firestoreDb = getFirestore(app);
    const firestoreAuth = getAuth(app);
    setDb(firestoreDb);
    setAuth(firestoreAuth);

    (async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(firestoreAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firestoreAuth);
        }
        setUserId(firestoreAuth.currentUser.uid);
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId || !db) return;

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const docRef = doc(db, 'artifacts', appId, 'users', userId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      let data = { profiles: {}, lastActiveProfile: null };
      if (docSnap.exists()) {
        data = docSnap.data();
      }
      setAppData(data);

      const lastProfile = data.lastActiveProfile;
      if (lastProfile && data.profiles[lastProfile]) {
        setProfileToLogin(lastProfile);
        setModal('login');
      } else if (Object.keys(data.profiles).length === 0) {
        setModal('profile');
      }
    });

    return () => unsubscribe();
  }, [userId, db]);

  // --- Profile and Data Logic ---
  const loadProfileData = useCallback((profileName) => {
    const profile = appData.profiles[profileName];
    if (!profile) return;

    setActiveProfile(profileName);
    setWeightData(profile.weightData || []);
    setGoalWeight(profile.goalWeight || null);
    setHeight(profile.height || null);
    setUnits(profile.units || 'kg');
    setIsLocked(false);

    if (!profile.height) {
      setModal('height');
    } else if (!profile.goalWeight) {
      setModal('goal');
    }
  }, [appData.profiles]);

  const saveCurrentProfileData = useCallback(async () => {
    if (!activeProfile || !db || !userId) return;

    const updatedProfileData = {
      ...appData.profiles[activeProfile],
      weightData,
      goalWeight,
      height,
      units,
    };

    const updatedAppData = {
      ...appData,
      lastActiveProfile: activeProfile,
      profiles: {
        ...appData.profiles,
        [activeProfile]: updatedProfileData,
      },
    };

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const docRef = doc(db, 'artifacts', appId, 'users', userId);
    await setDoc(docRef, updatedAppData);
  }, [activeProfile, appData, db, goalWeight, height, units, userId, weightData]);

  useEffect(() => {
    if (activeProfile) {
      saveCurrentProfileData();
    }
  }, [weightData, goalWeight, height, units, saveCurrentProfileData, activeProfile]);


  // --- Memoized Calculations for Stats & Chart ---
  const sortedWeightData = useMemo(
    () => [...weightData].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [weightData]
  );

  const stats = useMemo(() => {
    if (sortedWeightData.length === 0) return {};
    const firstEntry = sortedWeightData[0];
    const latestEntry = sortedWeightData[sortedWeightData.length - 1];
    if (!latestEntry) return {};

    const change =
      typeof latestEntry.weight === "number" && typeof firstEntry.weight === "number"
        ? latestEntry.weight - firstEntry.weight
        : null;
    const bmi =
      typeof latestEntry.weight === "number" && typeof height === "number"
        ? calculateBMI(latestEntry.weight, height)
        : "--";

    const now = Date.now();
    const weeklyData = sortedWeightData.filter(
      (d) => new Date(d.date).getTime() >= now - 7 * 86400000
    );
    const monthlyData = sortedWeightData.filter(
      (d) => new Date(d.date).getTime() >= now - 30 * 86400000
    );
    const weeklyAvg =
      weeklyData.length > 0
        ? weeklyData.reduce((s, c) => s + (typeof c.weight === "number" ? c.weight : 0), 0) /
          weeklyData.length
        : null;
    const monthlyAvg =
      monthlyData.length > 0
        ? monthlyData.reduce((s, c) => s + (typeof c.weight === "number" ? c.weight : 0), 0) /
          monthlyData.length
        : null;

    const allWeights = sortedWeightData
      .map((d) => d.weight)
      .filter((w) => typeof w === "number" && !isNaN(w));
    const lowestWeight = allWeights.length ? Math.min(...allWeights) : null;
    const highestWeight = allWeights.length ? Math.max(...allWeights) : null;

    let progress = null;
    if (
      typeof goalWeight === "number" &&
      goalWeight &&
      firstEntry &&
      typeof firstEntry.weight === "number" &&
      typeof latestEntry.weight === "number"
    ) {
      const start = firstEntry.weight;
      const current = latestEntry.weight;
      const goal = goalWeight;
      const totalDistance = Math.abs(start - goal);
      const traveledDistance = start - current;
      progress =
        totalDistance > 0
          ? (traveledDistance / (start - goal)) * 100
          : current <= goal
          ? 100
          : 0;
      progress = Math.max(0, Math.min(100, progress));
    }

    return {
      current: typeof latestEntry.weight === "number" ? latestEntry.weight : null,
      goal: typeof goalWeight === "number" ? goalWeight : null,
      change,
      bmi: typeof bmi === "string" ? bmi : Number(bmi),
      weeklyAvg,
      monthlyAvg,
      lowest: lowestWeight,
      highest: highestWeight,
      progress,
    };
  }, [sortedWeightData, goalWeight, height]);

  // --- Event Handlers ---
  const handleLogWeight = () => {
    if (!weightInput) return;
    const weightVal = parseFloat(weightInput);
    if (!weightVal || weightVal <= 0) return alert('Please enter a valid weight.');

    const previousLowest =
      weightData.length > 0
        ? Math.min(...weightData.map((d) => (typeof d.weight === "number" ? d.weight : Infinity)))
        : Infinity;
    const weightInKg = convertToKg(weightVal, units);

    setWeightData((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: new Date().toISOString(),
        weight: weightInKg,
        note: notesInput.trim(),
      },
    ]);
    setWeightInput('');
    setNotesInput('');

    setFlashStats(true);
    setTimeout(() => setFlashStats(false), 800);

    if (typeof goalWeight === "number" && goalWeight && weightInKg <= goalWeight) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    } else if (weightInKg < previousLowest) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 }, angle: 270, colors: ['#2563eb', '#ffffff'] });
    }
  };

  const handleCreateProfile = async () => {
    if (!profileInput.trim()) return alert('Please enter a profile name.');
    if (appData.profiles[profileInput.trim()]) return alert('Profile name already exists.');
    if (passwordInput.length < 4) return alert('Password must be at least 4 characters long.');
    if (passwordInput !== confirmPasswordInput) return alert('Passwords do not match.');

    const passwordHash = await hashPassword(passwordInput);
    const newProfileName = profileInput.trim();
    const newAppData = {
      ...appData,
      profiles: {
        ...appData.profiles,
        [newProfileName]: { weightData: [], units: 'kg', passwordHash },
      },
    };
    setAppData(newAppData);
    loadProfileData(newProfileName);
    setModal(null);
    setProfileInput('');
    setPasswordInput('');
    setConfirmPasswordInput('');
  };

  const handleLogin = async () => {
    if (!loginPasswordInput || !profileToLogin) return;
    const hash = await hashPassword(loginPasswordInput);
    if (hash === appData.profiles[profileToLogin].passwordHash) {
      setModal(null);
      setLoginPasswordInput('');
      loadProfileData(profileToLogin);
      setProfileToLogin(null);
    } else {
      alert('Incorrect password.');
    }
  };

  const handleSetGoal = () => {
    const val = parseFloat(goalInput);
    if (!val || val <= 0) return;
    setGoalWeight(convertToKg(val, units));
    setModal(null);
  };

  const handleSetHeight = () => {
    const val = parseFloat(heightInput);
    if (!val || val <= 0) return;
    setHeight(val / 100);
    setModal(null);
  };

  const handleDeleteEntry = () => {
    if (entryToDelete === null) return;
    setWeightData((prev) => prev.filter((entry) => entry.id !== entryToDelete));
    setEntryToDelete(null);
    setModal(null);
  };

  // --- Chart Data and Options ---
  const chartData = useMemo(() => {
    const dataPoints = sortedWeightData.map((d) => ({
      x: new Date(d.date),
      y:
        typeof d.weight === "number" && !isNaN(d.weight)
          ? convertFromKg(d.weight, units)
          : null,
    }));
    const trendData = [];
    if (sortedWeightData.length >= 7) {
      for (let i = 6; i < sortedWeightData.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = 0; j < 7; j++) {
          const w = sortedWeightData[i - j].weight;
          if (typeof w === "number" && !isNaN(w)) {
            sum += w;
            count++;
          }
        }
        trendData.push({
          x: new Date(sortedWeightData[i].date),
          y: count > 0 ? convertFromKg(sum / count, units) : null,
        });
      }
    }
    const datasets = [
      {
        label: `Weight (${units})`,
        data: dataPoints,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.2,
        pointRadius: 4,
      },
    ];
    if (trendData.length > 0) {
      datasets.push({
        label: '7-Day Trend',
        data: trendData,
        borderColor: '#f97316',
        fill: false,
        pointRadius: 0,
        borderWidth: 2,
      });
    }
    if (
      typeof goalWeight === "number" &&
      goalWeight &&
      dataPoints.length > 0
    ) {
      datasets.push({
        label: `Goal (${units})`,
        data: [
          { x: dataPoints[0].x, y: convertFromKg(goalWeight, units) },
          { x: dataPoints[dataPoints.length - 1].x, y: convertFromKg(goalWeight, units) },
        ],
        borderColor: '#10b981',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        type: 'line',
      });
    }
    return { datasets };
  }, [sortedWeightData, units, goalWeight]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day', tooltipFormat: 'MMM d, hh:mm a' },
        },
        y: {
          ticks: {
            callback: (value) =>
              typeof value === "number" && !isNaN(value)
                ? `${value.toFixed(1)} ${units}`
                : "--",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) =>
              typeof context.parsed.y === "number" && !isNaN(context.parsed.y)
                ? `Weight: ${context.parsed.y.toFixed(1)} ${units}`
                : "Weight: --",
            afterBody: (items) =>
              sortedWeightData.find(
                (d) => new Date(d.date).getTime() === items[0].parsed.x
              )?.note || "",
          },
        },
      },
    }),
    [units, sortedWeightData]
  );

  // --- Render ---
  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">MbareteFit</h1>
        <p className="text-slate-600 mt-2">
          Your comprehensive tool for tracking weight, BMI, and progress.
        </p>
      </header>

      {/* Top Controls */}
      <div className="flex justify-between items-center mb-6 gap-4">
        {/* Profile Switcher */}
        <div className="relative profile-switcher">
          <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition">
            <span>{activeProfile || 'Locked'}</span>
          </button>
          <div className="profile-dropdown absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20">
            <div className="py-1">
              {Object.keys(appData.profiles).map((name) => (
                <a
                  key={name}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setProfileToLogin(name);
                    setModal('login');
                  }}
                  className={`block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${
                    name === activeProfile ? 'font-bold bg-slate-100' : ''
                  }`}
                >
                  {name}
                </a>
              ))}
            </div>
            <div className="border-t border-slate-200">
              <button
                onClick={() => setModal('profile')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Add New Profile
              </button>
            </div>
          </div>
        </div>
        {/* Unit Toggle */}
        <div className="flex items-center bg-slate-200 rounded-full p-1">
          <button
            onClick={() => setUnits('kg')}
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              units === 'kg' ? 'bg-blue-600 text-white' : ''
            }`}
          >
            kg
          </button>
          <button
            onClick={() => setUnits('lbs')}
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              units === 'lbs' ? 'bg-blue-600 text-white' : ''
            }`}
          >
            lbs
          </button>
        </div>
      </div>

      <main
        className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${
          isLocked ? 'opacity-20 pointer-events-none' : ''
        }`}
      >
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{units}</span>
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
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <div className="space-y-3 text-sm">
              <StatItem
                label="Progress to Goal"
                value={
                  typeof stats.progress === "number" && !isNaN(stats.progress)
                    ? `${stats.progress.toFixed(0)}%`
                    : '--'
                }
                flash={flashStats}
              />
              <StatItem label="Current" value={formatWeight(stats.current, units)} flash={flashStats} />
              <StatItem label="Goal" value={formatWeight(stats.goal, units)} colorClass="text-blue-600" />
              <StatItem
                label="Change"
                value={
                  typeof stats.change === "number" && !isNaN(stats.change)
                    ? formatWeight(stats.change, units)
                    : '--'
                }
                colorClass={stats.change > 0 ? 'text-red-600' : 'text-green-600'}
                flash={flashStats}
              />
              <hr className="my-2" />
              <StatItem
                label="BMI"
                value={typeof stats.bmi === "number" && !isNaN(stats.bmi) ? stats.bmi : '--'}
                colorClass={getBmiColor(stats.bmi)}
                flash={flashStats}
              />
              <StatItem label="7-Day Avg" value={formatWeight(stats.weeklyAvg, units)} flash={flashStats} />
              <StatItem label="30-Day Avg" value={formatWeight(stats.monthlyAvg, units)} flash={flashStats} />
              <hr className="my-2" />
              <StatItem label="Lowest" value={formatWeight(stats.lowest, units)} />
              <StatItem label="Highest" value={formatWeight(stats.highest, units)} />
              <div className="grid grid-cols-2 gap-2 pt-4">
                <button
                  onClick={() => {
                    setGoalInput(
                      typeof stats.goal === "number" && !isNaN(stats.goal)
                        ? convertFromKg(stats.goal, units).toFixed(1)
                        : ''
                    );
                    setModal('goal');
                  }}
                  className="w-full bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg"
                >
                  Goal
                </button>
                <button
                  onClick={() => {
                    setHeightInput(height ? (height * 100).toFixed(0) : '');
                    setModal('height');
                  }}
                  className="w-full bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg"
                >
                  Height
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-md relative min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4">Progress Chart</h2>
            {sortedWeightData.length > 0 ? (
              <Line options={chartOptions} data={chartData} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                Chart appears here
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md relative min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4">History</h2>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {sortedWeightData.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 bg-slate-100">Date & Time</th>
                      <th className="py-2 px-4 bg-slate-100">Weight</th>
                      <th className="py-2 px-4 bg-slate-100">Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...sortedWeightData]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((entry, index) => (
                        <tr
                          key={entry.id}
                          className={`border-b border-slate-200 ${
                            index === 0 ? 'new-entry-animation' : ''
                          }`}
                        >
                          <td className="py-3 px-4">{new Date(entry.date).toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">
                            {formatWeight(entry.weight, units)}
                          </td>
                          <td className="py-3 px-4 italic truncate" title={entry.note}>
                            {entry.note}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setEntryToDelete(entry.id);
                                setModal('deleteEntry');
                              }}
                              className="text-slate-400 hover:text-red-500"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  History appears here
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={modal === 'profile'} onClose={() => setModal(null)}>
        <h2 className="text-2xl font-bold mb-4">Create Profile</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={profileInput}
            onChange={(e) => setProfileInput(e.target.value)}
            placeholder="Profile Name"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="password"
            value={confirmPasswordInput}
            onChange={(e) => setConfirmPasswordInput(e.target.value)}
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCreateProfile}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Create
          </button>
        </div>
      </Modal>
      <Modal isOpen={modal === 'login'} onClose={() => setModal(null)}>
        <h2 className="text-2xl font-bold mb-4">Login to {profileToLogin}</h2>
        <input
          type="password"
          value={loginPasswordInput}
          onChange={(e) => setLoginPasswordInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Login
          </button>
        </div>
      </Modal>
      <Modal isOpen={modal === 'goal'} onClose={() => setModal(null)}>
        <h2 className="text-2xl font-bold mb-4">Set Your Goal Weight</h2>
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
      <Modal isOpen={modal === 'height'} onClose={() => setModal(null)}>
        <h2 className="text-2xl font-bold mb-4">Set Your Height</h2>
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
      <Modal isOpen={modal === 'deleteEntry'} onClose={() => setModal(null)}>
        <h2 className="text-2xl font-bold mb-2">Delete Entry?</h2>
        <p className="text-slate-600 mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setModal(null)}
            className="bg-slate-200 text-slate-800 font-semibold py-2 px-6 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteEntry}
            className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}