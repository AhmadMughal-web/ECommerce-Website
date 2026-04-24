import React from "react";
import styles from "../../styles/style";
import EventCard from "./EventCard.jsx";
import { useSelector } from "react-redux";

const Event = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);

  return (
    <div>
      {!isLoading && (
        <div className={`${styles.section}`}>
          <div className={`${styles.heading}`}>
            <h1>Popular Events</h1>
          </div>
          <div className="w-full grid">
            {allEvents && allEvents.length > 0 ? (
              // FIXED: was passing prop as "allEvents" — EventCard expects "data"
              <EventCard data={allEvents[0]} active={true} />
            ) : (
              <h4 className="text-center text-gray-500 py-4">No Events available!</h4>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
