import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const Timer = ({ identifier }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paused, setPaused] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const SERVER_URL = process.env.REACT_APP_SERVER_URL || "";
    const socket = io(`${SERVER_URL}`, {
      transports: ["websocket"],
    });

    const syncTimer = () => {
      console.log("Fetching");
      fetch(`${SERVER_URL}/api/time/${identifier}`, {
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
  }, []);

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
          {Math.floor(timeRemaining / 60)}
          <span className="special">:</span>
          {timeRemaining % 60 < 10 ? "0" : ""}
          {timeRemaining % 60}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Timer;
