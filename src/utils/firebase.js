import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzzeNhnhMx4Hf5hJW_vz2V_jgindTysvs",
    authDomain: "mbaretefit-b6c57.firebaseapp.com",
    databaseURL: "https://mbaretefit-b6c57-default-rtdb.firebaseio.com",
    projectId: "mbaretefit-b6c57",
    storageBucket: "mbaretefit-b6c57.appspot.com",
    messagingSenderId: "33965493200",
    appId: "1:33965493200:web:07a9531bf2382755e007d5",
    measurementId: "G-W8JBF51MCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services for your components to use
export const auth = getAuth(app);
export const db = getDatabase(app);