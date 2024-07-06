import React from "react";
import Timer from "./Timer";
import "./App.css";

function App() {
  return (
    <div className="outer-box">
      <div>
        <h4>Match 1</h4>
        <Timer identifier="1" />
      </div>
      <div>
        <h4>Match 2</h4>
        <Timer identifier="2" />
      </div>
    </div>
  );
}

export default App;
