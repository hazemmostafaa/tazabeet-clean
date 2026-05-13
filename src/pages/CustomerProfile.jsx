import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";
import NotificationsPanel from "../components/NotificationsPanel";
function StarRating({ value, onChange }) {
    return (
        <div style={{ display: "flex", gap: 6, cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => onChange(star)}
                    style={{
                        fontSize: 20,
                        color: star <= value ? "#FFD700" : "#ccc",
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}
export default function CustomerProfile() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [ratingData, setRatingData] = useState({});
    const [openMessages, setOpenMessages] = useState("");
    const [reportData, setReportData] = useState({});
    const [favorites, setFavorites] = useState([]);

    const userName = localStorage.getItem("customer_name") || "Customer";
    const userEmail = localStorage.getItem("customer_email") || "example@email.com";
    const userPhone = localStorage.getItem("customer_phone") || "N/A";


    async function fetchJobs() {
        try {
            setLoading(true);
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/schedule/customer", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();

            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchJobs();
        fetchFavorites();
    }, []);

    async function fetchFavorites() {
        try {
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/customer/favorites", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            });
            const data = await res.json();
            if (res.ok) setFavorites(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
        }
    }


    function handleRatingChange(id, field, value) {
        setRatingData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    }


    async function submitRating(id) {
        const current = ratingData[id];

        if (!current?.rating) {
            toast.error("Please select rating");
            return;
        }

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/rate/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    rating: current.rating,
                    review: current.review || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to submit rating");
                return;
            }

            toast.success("Rating submitted.");
            window.location.reload();

        } catch (err) {
            console.log(err);
            toast.error("Error submitting rating");
        }
    }

    async function respondToQuote(id, decision) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/quote/${id}/${decision}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to update price response");
                return;
            }

            toast.success(data.message);
            fetchJobs();
        } catch (err) {
            console.log(err);
            toast.error("Error updating price response");
        }
    }

    async function submitReport(jobId) {
        const current = reportData[jobId] || {};
        if (!current.reason) return toast.error("Choose a report reason");

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/complaints/${jobId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    reason: current.reason,
                    details: current.details || "",
                }),
            });
            const data = await res.json();
            if (!res.ok) return toast.error(data.message || "Failed to send report");
            toast.success("Report sent to admin.");
            setReportData((prev) => ({ ...prev, [jobId]: { reason: "", details: "" } }));
        } catch (err) {
            console.log(err);
            toast.error("Error sending report");
        }
    }

    function renderPricing(job) {
        return (
            <div style={{
                marginTop: 10,
                background: "#fff8c9",
                border: "1px solid #FFD000",
                borderRadius: 10,
                padding: 10,
            }}>
                {job.estimatedPrice?.min && (
                    <div>
                        Estimate: <b>{job.estimatedPrice.min} - {job.estimatedPrice.max} {job.estimatedPrice.currency || "EGP"}</b>
                    </div>
                )}

                {job.finalPrice?.amount ? (
                    <div style={{ marginTop: 6 }}>
                        Final price: <b>{job.finalPrice.amount} {job.finalPrice.currency || "EGP"}</b>
                        <div>Status: <b>{job.finalPrice.status}</b></div>
                        {job.finalPrice.note && <div>Note: {job.finalPrice.note}</div>}

                        {job.finalPrice.status === "pending" && (
                            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    onClick={() => respondToQuote(job._id, "accept")}
                                    style={{
                                        background: "#000",
                                        color: "#FFD000",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                    }}
                                >
                                    Accept Price
                                </button>
                                <button
                                    type="button"
                                    onClick={() => respondToQuote(job._id, "decline")}
                                    style={{
                                        background: "#f1f1f1",
                                        color: "#111",
                                        border: "1px solid #ddd",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                    }}
                                >
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ marginTop: 6, color: "#666" }}>
                        Waiting for worker final price.
                    </div>
                )}
            </div>
        );
    }

    function renderTimeline(job) {
        const existing = Array.isArray(job.timeline) ? job.timeline : [];
        const timeline = existing.length
            ? existing
            : [
                {
                    key: job.status,
                    label: job.status === "pending" ? "Booking requested" : job.status,
                    createdAt: job.createdAt || job.date,
                },
            ];

        return (
            <div className="bookingTimeline">
                <h4>Booking timeline</h4>
                {timeline.map((event, index) => (
                    <div className="timelineItem" key={`${event.key}-${event.createdAt}-${index}`}>
                        <span className="timelineDot" />
                        <div>
                            <b>{event.label || event.key}</b>
                            {event.note && <p>{event.note}</p>}
                            {event.createdAt && (
                                <small>{new Date(event.createdAt).toLocaleString()}</small>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    function logout() {
        localStorage.clear();
        navigate("/", { replace: true });
        window.location.reload();
    }

    return (
        <div className="lp">
            <div className="lpTopLanding">
                <div style={{ padding: 20, fontFamily: "system-ui" }}>


                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        marginRight: 230,
                    }}>
                        <h1>My Profile</h1>

                        <button onClick={logout} style={{
                            background: "#000",
                            color: "#FFD000",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: 17,
                            cursor: "pointer",
                            fontWeight: 900,
                            height: 40,
                            width: 100,
                            marginRight: 10,

                        }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            <div style={{
                marginTop: 16,
                background: "#fff",
                padding: 16,
                borderRadius: 14,
                boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
            }}>
                <h3>Account Info</h3>
                <div>Name: <b>{userName}</b></div>
                <div>Email: <b>{userEmail}</b></div>
                <div>Phone: <b>{userPhone}</b></div>
            </div>

            <NotificationsPanel />

            <div style={{
                marginTop: 18,
                background: "#fff",
                padding: 16,
                borderRadius: 14,
            }}>
                <h3>Favorite Workers</h3>
                {favorites.length === 0 ? (
                    <p>No favorite workers yet.</p>
                ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                        {favorites.map((worker) => (
                            <button
                                key={worker._id}
                                type="button"
                                onClick={() => navigate(`/worker/${worker._id}`)}
                                style={{
                                    textAlign: "left",
                                    border: "1px solid #eee",
                                    background: "#fff8c9",
                                    borderRadius: 10,
                                    padding: 10,
                                    cursor: "pointer",
                                }}
                            >
                                <b>{worker.name}</b>
                                <div>⭐ {worker.rating || 0} ({worker.totalReviews || 0})</div>
                            </button>
                        ))}
                    </div>
                )}
            </div>


            <div style={{
                marginTop: 18,
                background: "#fff",
                padding: 16,
                borderRadius: 14,
            }}>
                <h3>My Bookings</h3>

                {loading ? "Loading..." :
                    jobs.filter(j => j.status !== "completed").length === 0 ? (
                        <p>No active bookings.</p>
                    ) : (
                        jobs
                            .filter(j => j.status !== "completed")
                            .map(j => (
                                <div key={j._id} style={{
                                    border: "1px solid #eee",
                                    padding: 12,
                                    borderRadius: 10,
                                    marginBottom: 10
                                }}>
                                    <b>{j.service}</b>
                                    <div>Worker: {j.worker?.name || "N/A"}</div>
                                    <div>Worker Phone: {j.worker?.phone || "N/A"}</div>
                                    <div>📅 {new Date(j.date).toLocaleDateString()}</div>
                                    {j.description && <div>Issue: {j.description}</div>}
                                    {renderPricing(j)}
                                    {renderTimeline(j)}

                                    <div style={{
                                        marginTop: 6,
                                        fontWeight: "bold",
                                        color:
                                            j.status === "confirmed"
                                                ? "green"
                                                : j.status === "pending"
                                                    ? "orange"
                                                    : "red"
                                    }}>
                                        {j.status}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setOpenMessages(openMessages === j._id ? "" : j._id)}
                                        style={{
                                            marginTop: 10,
                                            background: "#000",
                                            color: "#FFD000",
                                            border: "none",
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Messages
                                    </button>

                                    {openMessages === j._id && (
                                        <CustomerBookingMessages scheduleId={j._id} />
                                    )}

                                    <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 10 }}>
                                        <b>Report this booking</b>
                                        <select
                                            value={reportData[j._id]?.reason || ""}
                                            onChange={(e) =>
                                                setReportData((prev) => ({
                                                    ...prev,
                                                    [j._id]: { ...prev[j._id], reason: e.target.value },
                                                }))
                                            }
                                            style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 8 }}
                                        >
                                            <option value="">Choose reason</option>
                                            <option value="Worker did not arrive">Worker did not arrive</option>
                                            <option value="Wrong final price">Wrong final price</option>
                                            <option value="Bad behavior">Bad behavior</option>
                                            <option value="Poor service">Poor service</option>
                                        </select>
                                        <input
                                            value={reportData[j._id]?.details || ""}
                                            placeholder="More details..."
                                            onChange={(e) =>
                                                setReportData((prev) => ({
                                                    ...prev,
                                                    [j._id]: { ...prev[j._id], details: e.target.value },
                                                }))
                                            }
                                            style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => submitReport(j._id)}
                                            style={{ marginTop: 8, background: "#111", color: "#FFD000", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: "bold" }}
                                        >
                                            Send Report
                                        </button>
                                    </div>
                                </div>
                            ))
                    )}
            </div>


            <div style={{
                marginTop: 18,
                background: "#fff",
                padding: 16,
                borderRadius: 14,
            }}>
                <h3>Previous Services</h3>

                {jobs.filter(j => j.status === "completed").length === 0 ? (
                    <p>No completed services yet.</p>
                ) : (
                    jobs
                        .filter(j => j.status === "completed")
                        .map(j => (
                            <div key={j._id} style={{
                                border: "1px solid #eee",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                                transition: "0.2s",
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.08)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.boxShadow = "none";
                                }}>
                                <b>{j.service}</b>
                                <div>Worker: {j.worker?.name || "N/A"}</div>
                                <div>Worker Phone: {j.worker?.phone || "N/A"}</div>
                                <div>📅 {new Date(j.date).toLocaleDateString()}</div>
                                {renderPricing(j)}
                                {renderTimeline(j)}

                                <div style={{ color: "blue", fontWeight: "bold" }}>
                                    Completed ✅
                                </div>


                                {j.rating ? (
                                    <div style={{ marginTop: 6 }}>
                                        ⭐ {j.rating} / 5
                                        {j.review && <div>💬 {j.review}</div>}
                                    </div>
                                ) : (

                                    <div style={{ marginTop: 10 }}>
                                        <StarRating
                                            value={ratingData[j._id]?.rating || 0}
                                            onChange={(val) => handleRatingChange(j._id, "rating", val)}
                                        />

                                        <input
                                            placeholder="Write review..."
                                            onChange={(e) =>
                                                handleRatingChange(j._id, "review", e.target.value)
                                            }
                                        />

                                        <button
                                            onClick={() => submitRating(j._id)}
                                            style={{
                                                background: "linear-gradient(135deg, #FFD000, #ffb800)",
                                                border: "none",
                                                padding: "10px",
                                                borderRadius: 10,
                                                fontWeight: "bold",
                                                cursor: "pointer",
                                                transition: "0.2s",
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.transform = "translateY(-2px)";
                                                e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)";
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.transform = "translateY(0)";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>


            <button
                onClick={() => navigate(-1)}
                style={{
                    marginTop: 20,
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "2px solid #ddd",
                    background: "transparent",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "0.2s",
                }}
                onMouseOver={(e) => {
                    e.target.style.background = "#000";
                    e.target.style.color = "#FFD000";
                    e.target.style.borderColor = "#000";
                }}
                onMouseOut={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#000";
                    e.target.style.borderColor = "#ddd";
                }}
            >
                ← Back
            </button>
        </div>
    );
}

function CustomerBookingMessages({ scheduleId }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("user_id");

    async function fetchMessages() {
        try {
            setLoading(true);
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/messages/customer/${scheduleId}`, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to load messages");
                return;
            }

            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            toast.error("Error loading messages");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMessages();
    }, [scheduleId]);

    async function sendMessage(e) {
        e.preventDefault();

        const messageText = text.trim();
        if (!messageText) return;

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/messages/customer/${scheduleId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ text: messageText }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to send message");
                return;
            }

            setText("");
            toast.success("Message sent.");
            fetchMessages();
        } catch (err) {
            console.log(err);
            toast.error("Error sending message");
        }
    }

    return (
        <div style={{
            marginTop: 12,
            borderTop: "1px solid #eee",
            paddingTop: 12,
        }}>
            {loading ? (
                <p>Loading messages...</p>
            ) : (
                <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                    {messages.length === 0 ? (
                        <p>No messages yet.</p>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message._id}
                                style={{
                                    justifySelf: message.sender?._id === userId ? "end" : "start",
                                    maxWidth: "80%",
                                    background: message.sender?._id === userId ? "#000" : "#f2f2f2",
                                    color: message.sender?._id === userId ? "#FFD000" : "#111",
                                    padding: 10,
                                    borderRadius: 8,
                                }}
                            >
                                <div>{message.text}</div>
                                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                                    {message.sender?.name || "User"}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Message your worker..."
                    style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        background: "#000",
                        color: "#FFD000",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
