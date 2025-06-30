import React, { useEffect } from "react";
import { auth } from "./firebase";
import { signInAnonymously } from "firebase/auth";
import SetHeight from "./components/SetHeight";

function App() {
    useEffect(() => {
        signInAnonymously(auth);
    }, []);
    return (
        <div style={{ padding: 40 }}>
            <h1>MbareteFit</h1>
            <SetHeight />
        </div>
    );
}

export default App;