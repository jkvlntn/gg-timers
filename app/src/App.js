import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Timer from "./Timer";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/server1" element={<Timer identifier={"1"} />} />
        <Route path="/server2" element={<Timer identifier={"2"} />} />
      </Routes>
    </Router>
  );
}

export default App;
