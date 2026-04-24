import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../server";

const CountDown = ({ data }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [deleted, setDeleted] = useState(false);

  function calculateTimeLeft() {
    const difference = +new Date(data?.Finish_Date) - +new Date();
    if (difference <= 0) return {};
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    if (deleted || !data?._id) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (Object.keys(newTimeLeft).length === 0 && !deleted) {
        // FIXED: was missing "/event/" prefix — was hitting wrong route
        axios
          .delete(`${server}/event/delete-shop-event/${data._id}`, {
            withCredentials: true,
          })
          .then(() => setDeleted(true))
          .catch((err) => console.error("Failed to delete expired event:", err));
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?._id, data?.Finish_Date, deleted]);

  const timerComponents = Object.keys(timeLeft)
    .map((interval) => {
      if (!timeLeft[interval]) return null;
      return (
        <span key={interval} className="text-[25px] text-[#475ad2]">
          {timeLeft[interval]} {interval}{" "}
        </span>
      );
    })
    .filter(Boolean);

  return (
    <div>
      {deleted ? (
        <span className="text-[red] text-[25px]">Event Ended</span>
      ) : timerComponents.length ? (
        timerComponents
      ) : (
        <span className="text-[red] text-[25px]">Time's Up!</span>
      )}
    </div>
  );
};

export default CountDown;
