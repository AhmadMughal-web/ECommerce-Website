import React, { useEffect } from "react";
import Header from "../components/layout/Header";
import EventCard from "../components/Events/EventCard";
import Footer from "../components/layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "../redux/actions/event";

const EventPage = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);
  // FIXED: removed console.log("Redux events state:", allEvents, isLoading)
  const dispatch = useDispatch();

  useEffect(() => {
    if (!allEvents || allEvents.length === 0) {
      dispatch(getAllEvents());
    }
  }, [dispatch]);

  return (
    <div>
      <Header activeHeading={4} />

      {isLoading ? (
        <p className="text-center text-2xl text-gray-500 py-10">Loading events...</p>
      ) : allEvents && allEvents.length > 0 ? (
        <div className="flex flex-col">
          {allEvents.map((event, index) => (
            <EventCard key={index} data={event} active={true} />
          ))}
        </div>
      ) : (
        <p className="text-center text-2xl text-gray-500 py-10">
          No events available!
        </p>
      )}

      <Footer />
    </div>
  );
};

export default EventPage;
