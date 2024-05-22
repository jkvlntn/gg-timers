import React from "react";
import { useState, useEffect } from "react";

const Timer = () => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paused, setPaused] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchTimerData();
  }, []);

  const fetchTimerData = () => {
    fetch("http://localhost:8000/timer/time", {
      method: "POST",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setTimeRemaining(data.time);
        setPaused(data.paused);
        setLoaded(true);
      })
      .catch((error) => {});
  };

  return (
    <div className="timer-box">
      {loaded ? (
        <div>
          <span>{timeRemaining / 60} </span>
          <span>Minutes</span>
        </div>
      ) : (
        <div></div>
      )}
      {loaded ? (
        <div>
          <span>{timeRemaining % 60} </span>
          <span>Seconds</span>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Timer;
