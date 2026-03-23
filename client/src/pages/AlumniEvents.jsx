import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { formatDateDMY } from "../utils/dateFormat";

export default function AlumniEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await API.get("/events");
        setEvents(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEvents();
  }, []);

  const now = new Date();
  const upcoming = useMemo(
    () => events.filter((event) => new Date(event.eventDate) >= now),
    [events, now],
  );
  const past = useMemo(
    () => events.filter((event) => new Date(event.eventDate) < now),
    [events, now],
  );

  const renderEventCard = (event) => (
    <article key={event._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-xl font-semibold text-[#253B7B]">{event.title}</h3>
      <p className="text-sm text-gray-500 mt-1">{formatDateDMY(event.eventDate)}</p>
      <p className="text-gray-700 mt-2">{event.location || "Location TBD"}</p>
      <p className="text-gray-600 mt-3">{event.description || "No description"}</p>
      {event.registrationLink && (
        <a
          href={event.registrationLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-4 bg-orange-600 text-white px-4 py-2 rounded text-sm"
        >
          Register
        </a>
      )}
    </article>
  );

  return (
    <div className="p-4 md:p-8 space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Upcoming Events</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.length ? upcoming.map(renderEventCard) : <p className="text-gray-600">No upcoming events.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Past Events</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {past.length ? past.map(renderEventCard) : <p className="text-gray-600">No past events yet.</p>}
        </div>
      </section>
    </div>
  );
}
