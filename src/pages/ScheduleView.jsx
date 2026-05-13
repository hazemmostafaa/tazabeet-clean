import React, { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { api } from "../api";


const locales = { "en-US": enUS };

const servicesList = [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Painting",
    "Carpentry",
    "AC Repair",
    "Pest Control",
    "Carpets",
    "Alumetal",
    "Tiling",
    "Gypsum Boards",
    "Appliances"
];

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales,
});

export default function ScheduleView() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [service, setService] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [err, setErr] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);


    const calendarEvents = useMemo(() => {
        return (events || []).map((e) => {
            const startTime = e.startTime.includes("AM") || e.startTime.includes("PM")
                ? convertTo24(e.startTime)
                : e.startTime;

            const endTime = e.endTime.includes("AM") || e.endTime.includes("PM")
                ? convertTo24(e.endTime)
                : e.endTime;

            const start = new Date(`${e.date.split("T")[0]}T${startTime}`);
            const end = new Date(`${e.date.split("T")[0]}T${endTime}`);

            return {
                id: e._id,
                title: `${e.service || "Service"}`,
                start,
                end,
            };
        });
    }, [events]);


    async function load() {
        try {
            setLoading(true);
            const res = await api.get("/api/schedule/my");
            setEvents(res.data || []);
        } catch (e) {
            console.log(e);
            setErr("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);


    async function addEvent(e) {
        e.preventDefault();
        setErr("");

        console.log("SERVICE:", service);

        if (!service) {
            setErr("Please select a service");
            return;
        }

        if (!start || !end) {
            setErr("Start and end time are required.");
            return;
        }

        if (new Date(end) <= new Date(start)) {
            setErr("End must be after start.");
            return;
        }

        try {
            const date = new Date(start).toISOString().split("T")[0];

            const startTime = new Date(start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            const endTime = new Date(end).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });

            await api.post("/api/schedule/add", {
                date,
                startTime,
                endTime,
                service,
            });


            setService("");
            setStart("");
            setEnd("");

            load();
        } catch (e2) {
            console.log(e2);
            setErr(e2?.response?.data?.message || "Failed to create event");
        }
    }


    async function deleteEvent(id) {
        try {
            await api.delete(`/api/schedule/${id}`);
            load();
        } catch (e) {
            setErr("Failed to delete");
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Schedule</h1>
            <p style={{ opacity: 0.7 }}>
                Add your available time slots
            </p>

            {err && (
                <div style={{ color: "red", marginTop: 10 }}>
                    {err}
                </div>
            )}


            <div style={card}>
                <h3>Add Available Slot</h3>

                <form onSubmit={addEvent} style={{ display: "grid", gap: 10 }}>


                    <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        required
                        style={input}
                    >
                        <option value="">Select Service</option>
                        {servicesList.map((s, i) => (
                            <option key={i} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    <label>Start</label>
                    <input
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        style={input}
                    />

                    <label>End</label>
                    <input
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        style={input}
                    />

                    <button type="submit" style={btn}>
                        Add Slot
                    </button>
                </form>
            </div>


            <div style={card}>
                <h3>Calendar {loading && "(Loading...)"}</h3>

                <div style={{ height: 500 }}>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        views={["month", "week", "day"]}
                        defaultView="week"
                        style={{ height: "100%" }}
                        onSelectEvent={(event) => {
                            setSelectedEvent(event);
                            setShowModal(true);
                        }}

                    />
                </div>
            </div>
            {
                showModal && (
                    <div style={overlay}>
                        <div style={modal}>
                            <h3>Delete Slot</h3>
                            <p>Are you sure you want to delete this slot?</p>

                            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                                <button
                                    style={cancelBtn}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    style={deleteBtn}
                                    onClick={() => {
                                        deleteEvent(selectedEvent.id);
                                        setShowModal(false);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}



function convertTo24(time) {
    const [hourMin, modifier] = time.split(" ");
    let [hours, minutes] = hourMin.split(":");

    if (modifier === "PM" && hours !== "12") {
        hours = parseInt(hours, 10) + 12;
    }
    if (modifier === "AM" && hours === "12") {
        hours = "00";
    }

    return `${hours}:${minutes}`;
}


const card = {
    marginTop: 16,
    background: "#fff",
    padding: 16,
    borderRadius: 14,
};

const input = {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
};

const btn = {
    marginTop: 10,
    background: "#000",
    color: "#FFD000",
    border: "none",
    padding: 12,
    borderRadius: 10,
    fontWeight: 900,
    cursor: "pointer",
};
const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
};

const modal = {
    background: "#fff",
    padding: 25,
    borderRadius: 15,
    width: 320,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const cancelBtn = {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#ccc",
    cursor: "pointer",
};

const deleteBtn = {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#ff4d4f",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
};