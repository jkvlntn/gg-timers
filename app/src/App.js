import React from "react";
import Timer from "./Timer";
import "./App.css";

function App() {
  return (
    <div className="outer-box">
      <h4>Time Remaining in Server 1:</h4>
      <Timer identifier="1" />
    </div>
  );
}

export default App;
