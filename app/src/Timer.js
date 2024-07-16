import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const Timer = ({ identifier }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const SERVER_URL = process.env.REACT_APP_SERVER_URL || "";
    const socket = io(`${SERVER_URL}`, {
      transports: ["websocket"],
    });

    socket.on(`update${identifier}`, (timeRemaining, paused) => {
      setTimeRemaining(timeRemaining);
      setPaused(paused);
    });

    socket.emit(`get${identifier}`);

    return () => {
      socket.off(`update${identifier}`);
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
    <div className="outer-box">
      <h4>Time Remaining in Server {identifier}</h4>
      <div className={`timer-box ${paused ? "red" : ""}`}>
        {timeRemaining !== null ? (
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
    </div>
  );
};

export default Timer;
