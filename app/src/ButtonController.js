import React from "react";

const ButtonController = () => {
  const startTimer = () => {
    fetch("http://localhost:8000/timer/start", {
      method: "POST",
    })
      .then((response) => {})
      .catch((error) => {
        console.log("Failed to start timer");
      });
  };

  const pauseTimer = () => {
    fetch("http://localhost:8000/timer/pause", {
      method: "POST",
    })
      .then((response) => {})
      .catch((error) => {
        console.log("Failed to pause timer");
      });
  };

  const resetTimer = () => {
    fetch("http://localhost:8000/timer/reset", {
      method: "POST",
    })
      .then((response) => {})
      .catch((error) => {
        console.log("Failed to reset timer");
      });
  };

  return (
    <div className="button-box">
      <button onClick={startTimer}>Start</button>
      <button onClick={pauseTimer}>Pause</button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
};

export default ButtonController;
