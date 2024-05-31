import React from "react";
import { useState, useEffect } from "react";
import io from "socket.io-client";

const Timer = () => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paused, setPaused] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const socket = io("http://localhost:8000/", { transports: ["websocket"] });

  useEffect(() => {
    syncTimer();
    socket.on("update", () => {
      syncTimer();
    });
    return () => {
      socket.off("update");
    };
  }, []);

  useEffect(() => {
    console.log("changing paused:" + paused);
    let interval = null;
    if (paused) {
      interval = clearInterval(interval);
    } else {
      interval = setInterval(() => {
        setTimeRemaining((timeRemaining) => timeRemaining - 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [paused]);

  const syncTimer = () => {
    fetch("http://localhost:8000/timer/time", {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("Updating timer");
        setTimeRemaining(data.time);
        setPaused(data.paused);
        setLoaded(true);
      })
      .catch((error) => {
        console.log("Timer update failed");
      });
  };

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
