import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Your Firebase configuration (with databaseURL!)
const firebaseConfig = {
  apiKey: "AIzaSyCzzeNhnhMx4Hf5hJW_vz2V_jgindTysvs",
  authDomain: "mbaretefit-b6c57.firebaseapp.com",
  databaseURL: "https://mbaretefit-b6c57-default-rtdb.firebaseio.com", // <-- IMPORTANT: now included
  projectId: "mbaretefit-b6c57",
  storageBucket: "mbaretefit-b6c57.appspot.com",
  messagingSenderId: "33965493200",
  appId: "1:33965493200:web:07a9531bf2382755e007d5",
  measurementId: "G-W8JBF51MCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// UI Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const chartContainer = document.getElementById('chartContainer');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const authMsg = document.getElementById('auth-msg');
const logoutBtn = document.getElementById('logout');
const weightInput = document.getElementById('weight-input');
const logWeightBtn = document.getElementById('log-weight-btn');
const historyEl = document.getElementById('history');
const weightChartCanvas = document.getElementById('weightChart');
let weightChart = null;

// App State
let userId = null;
let userWeights = [];

// Show/hide app sections
function showApp(loggedIn) {
  authContainer.style.display = loggedIn ? 'none' : '';
  appContainer.style.display = loggedIn ? '' : 'none';
  chartContainer.style.display = loggedIn ? '' : 'none';
}

// Render weight history
function renderHistory() {
  historyEl.innerHTML = '';
  userWeights.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.date}: ${entry.weight} kg`;
    historyEl.appendChild(li);
  });
}

// Render Chart.js chart
function renderChart() {
  const labels = userWeights.map(e => e.date);
  const data = userWeights.map(e => e.weight);

  if (weightChart) weightChart.destroy();
  weightChart = new Chart(weightChartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: "Weight (kg)",
        data,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.1)",
        fill: true,
        tension: 0.2,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Weight (kg)" } }
      }
    }
  });
}

// Handle weight log
logWeightBtn.onclick = async () => {
  const weight = parseFloat(weightInput.value);
  if (!weight || weight <= 0) return alert("Enter a valid weight.");
  const date = new Date().toISOString().slice(0,10);
  const newEntry = { date, weight };
  await push(ref(db, 'users/' + userId + '/weights'), newEntry);
  weightInput.value = '';
};

// Listen for weight changes
function listenForWeights() {
  onValue(ref(db, 'users/' + userId + '/weights'), snapshot => {
    const data = snapshot.val() || {};
    userWeights = Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
    renderHistory();
    renderChart();
  });
}

// Email/Password Auth handler
loginBtn.onclick = async () => {
  const email = emailInput.value;
  const pass = passwordInput.value;
  authMsg.textContent = '';
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
      } catch (err) {
        authMsg.textContent = err.message;
      }
    } else {
      authMsg.textContent = e.message;
    }
  }
};

// Google Auth handler
const provider = new GoogleAuthProvider();
googleLoginBtn.onclick = async () => {
  authMsg.textContent = '';
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    authMsg.textContent = e.message;
  }
};

logoutBtn.onclick = () => signOut(auth);

// Auth state listener
onAuthStateChanged(auth, user => {
  if (user) {
    userId = user.uid;
    showApp(true);
    listenForWeights();
  } else {
    showApp(false);
    if (weightChart) weightChart.destroy();
  }
});
