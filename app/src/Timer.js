import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const Timer = ({ identifier }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paused, setPaused] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const socket = io();

    const syncTimer = () => {
      console.log("Fetching");
      fetch(`/api/time/${identifier}`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          setTimeRemaining(data.time);
          setPaused(data.paused);
          setLoaded(true);
        })
        .catch((error) => {
          console.log("Timer update failed");
        });
    };

    socket.on(`update${identifier}`, syncTimer);
    syncTimer();

    return () => {
      socket.off(`update${identifier}`, syncTimer);
      socket.disconnect();
    };
  }, [identifier]);

  useEffect(() => {
    let interval = null;

    if (!paused) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paused]);

  return (
    <div className={`timer-box ${paused ? "red" : ""}`}>
      {loaded ? (
        <div>
          <span>{Math.floor(timeRemaining / 60)} </span>
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
