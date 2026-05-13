import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScheduleView from "./ScheduleView";
import "./worker.css";
import NotificationsPanel from "../components/NotificationsPanel";

export default function WorkerDashboard() {
    const navigate = useNavigate();
    const [active, setActive] = useState("dashboard");
    const [jobs, setJobs] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    useEffect(() => {
        fetchRatings();
    }, []);

    async function fetchRatings() {
        <div style={{ marginTop: 20 }}>
            <h2>⭐ My Ratings</h2>

            <div style={{ marginBottom: 10 }}>
                Average: <b>{avgRating}</b> ({ratingCount} reviews)
            </div>

            {ratings.length === 0 ? (
                <p>No ratings yet</p>
            ) : (
                ratings.map((r) => (
                    <div key={r._id} style={{
                        border: "1px solid #eee",
                        padding: 10,
                        borderRadius: 10,
                        marginBottom: 8
                    }}>
                        <div>⭐ {r.rating} / 5</div>
                        <div>👤 {r.customer?.name}</div>
                        {r.review && <div>💬 {r.review}</div>}
                    </div>
                ))
            )}
        </div>
        try {
            const userId = localStorage.getItem("user_id");

            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/worker-ratings/${userId}`);
            const data = await res.json();

            setRatings(data.ratings);
            setAvgRating(data.average);
            setRatingCount(data.count);

        } catch (err) {
            console.log(err);
        }
    }
    async function fetchJobs() {
        try {
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/schedule/worker", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();
            if (Array.isArray(data)) {
                setJobs(data);
            }
        } catch (err) {
            console.log(err);
        }
    }


    async function fetchJobs() {
        try {
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/schedule/worker", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();
            if (Array.isArray(data)) {
                setJobs(data);
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchJobs();
    }, []);

    const stats = useMemo(() => {
        const completedJobs = jobs.filter(j => j.status === "completed");

        return {
            activeJobs: jobs.filter(j => j.status === "confirmed").length,
            completed: completedJobs.length,
            earnings: completedJobs.length * 50,
        };
    }, [jobs]);

    function logout() {
        localStorage.clear();
        navigate("/");
    }

    return (
        <div className="wd">

            <Sidebar active={active} setActive={setActive} onLogout={logout} />

            <div className="wdContent">
                {active === "dashboard" && <DashboardView stats={stats} jobs={jobs} refreshJobs={fetchJobs} />}
                {active === "jobs" && <JobsView jobs={jobs} refreshJobs={fetchJobs} />}
                {active === "schedule" && <ScheduleView />}
                {active === "messages" && <MessagesView />}
                {active === "profile" && <ProfileView />}
            </div>
            <div className="mobileBottomNav">
                <button onClick={() => setActive("dashboard")} className={active === "dashboard" ? "active" : ""}>
                    📊 <span>Dashboard</span>
                </button>

                <button onClick={() => setActive("jobs")} className={active === "jobs" ? "active" : ""}>
                    💼 <span>Jobs</span>
                </button>

                <button onClick={() => setActive("schedule")} className={active === "schedule" ? "active" : ""}>
                    📅 <span>Schedule</span>
                </button>

                <button onClick={() => setActive("messages")} className={active === "messages" ? "active" : ""}>
                    💬 <span>Messages</span>
                </button>

                <button onClick={() => setActive("profile")} className={active === "profile" ? "active" : ""}>
                    👤 <span>Profile</span>
                </button>
                <button onClick={logout}>
                    🚪 <span>Logout</span>
                </button>
            </div>
        </div>
    );
}


function Sidebar({ active, setActive, onLogout }) {
    const items = [
        { key: "dashboard", label: "Dashboard" },
        { key: "jobs", label: "My Jobs" },
        { key: "schedule", label: "Schedule" },
        { key: "messages", label: "Messages" },
        { key: "profile", label: "Profile" },
    ];

    return (
        <div className="wdSidebar">
            <div className="wdLogo">TAZABEET</div>

            <div className="wdMenu">
                {items.map((it) => (
                    <button
                        key={it.key}
                        onClick={() => setActive(it.key)}
                        className={`wdMenuItem ${active === it.key ? "active" : ""}`}
                    >
                        {it.label}
                    </button>
                ))}
            </div>

            <button className="wdLogout" onClick={onLogout}>
                Logout
            </button>
        </div>
    );
}


function DashboardView({ stats, jobs, refreshJobs }) {
    return (
        <div>
            <h1>Dashboard</h1>

            <div className="wdCards">
                <Card title="Active Jobs" value={stats.activeJobs} />
                <Card title="Completed" value={stats.completed} />
                <Card title="Earnings" value={`$${stats.earnings}`} />
            </div>

            <Panel title="Recent Jobs">
                <JobsTable jobs={jobs.slice(0, 5)} refreshJobs={refreshJobs} />
            </Panel>
        </div>
    );
}


function JobsView({ jobs, refreshJobs }) {
    const [filter, setFilter] = useState("all");

    const filteredJobs =
        filter === "all"
            ? jobs
            : jobs.filter(j => j.status === filter);
    return (
        <div>
            <h1>My Jobs</h1>

            <div style={{ marginBottom: 10 }}>
                <div className="filterBar">
                    <button
                        className={`filterBtn ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </button>

                    <button
                        className={`filterBtn ${filter === "pending" ? "active" : ""}`}
                        onClick={() => setFilter("pending")}
                    >
                        Pending
                    </button>

                    <button
                        className={`filterBtn ${filter === "confirmed" ? "active" : ""}`}
                        onClick={() => setFilter("confirmed")}
                    >
                        Confirmed
                    </button>

                    <button
                        className={`filterBtn ${filter === "completed" ? "active" : ""}`}
                        onClick={() => setFilter("completed")}
                    >
                        Completed
                    </button>
                    <button
                        className={`filterBtn ${filter === "rejected" ? "active" : ""}`}
                        onClick={() => setFilter("rejected")}
                    >
                        Rejected
                    </button>
                    <button
                        className={`filterBtn ${filter === "cancelled" ? "active" : ""}`}
                        onClick={() => setFilter("cancelled")}
                    >
                        Cancelled
                    </button>
                </div>
            </div>

            <Panel title="All Jobs">
                <JobsTable jobs={filteredJobs} refreshJobs={refreshJobs} />
            </Panel>
        </div>
    );


    return (
        <div>
            <h1>My Jobs</h1>
            <Panel title="All Jobs">
                <JobsTable jobs={jobs} refreshJobs={refreshJobs} />
            </Panel>
        </div>
    );

}



function JobsTable({ jobs, refreshJobs }) {
    const [quoteData, setQuoteData] = useState({});

    if (!jobs.length) return <p>No jobs yet.</p>;

    function getJobAddress(job) {
        return (
            job.address ||
            job.customerAddress ||
            job.bookingAddress ||
            job.customer?.address ||
            ""
        );
    }

    function getJobLocation(job) {
        return job.location || job.customerLocation || job.bookingLocation;
    }

    function formatPayment(paymentType) {
        if (!paymentType) return "Cash";
        return paymentType
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    function formatEstimate(job) {
        if (!job.estimatedPrice?.min || !job.estimatedPrice?.max) return "Not estimated";
        return `${job.estimatedPrice.min} - ${job.estimatedPrice.max} ${job.estimatedPrice.currency || "EGP"}`;
    }

    function formatFinalPrice(job) {
        if (!job.finalPrice?.amount) return "No final price";
        return `${job.finalPrice.amount} ${job.finalPrice.currency || "EGP"} (${job.finalPrice.status || "pending"})`;
    }

    function formatProgress(progressStatus) {
        const labels = {
            requested: "Requested",
            accepted: "Accepted",
            price_sent: "Price sent",
            price_accepted: "Price accepted",
            on_the_way: "On the way",
            arrived: "Arrived",
            work_started: "Work started",
            completed: "Completed",
            cancelled: "Cancelled",
        };

        return labels[progressStatus] || "Slot created";
    }


    async function completeJob(id) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/complete/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed");
                return;
            }

            toast.success("Job completed.");
            refreshJobs();

        } catch (err) {
            console.log(err);
            toast.error("Error completing job");
        }
    }


    async function acceptJob(id) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/accept/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed");
                return;
            }

            toast.success("Job accepted.");
            refreshJobs();

        } catch (err) {
            console.log(err);
            toast.error("Error accepting job");
        }
    }

    async function sendFinalPrice(id) {
        const current = quoteData[id] || {};

        if (!current.amount) {
            toast.error("Enter the final price.");
            return;
        }

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/final-price/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    amount: current.amount,
                    note: current.note || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to send final price");
                return;
            }

            toast.success("Final price sent to customer.");
            setQuoteData((prev) => ({ ...prev, [id]: { amount: "", note: "" } }));
            refreshJobs();
        } catch (err) {
            console.log(err);
            toast.error("Error sending final price");
        }
    }

    async function updateProgress(id, progressStatus) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/progress/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ progressStatus }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to update progress");
                return;
            }

            toast.success("Progress updated.");
            refreshJobs();
        } catch (err) {
            console.log(err);
            toast.error("Error updating progress");
        }
    }


    async function rejectJob(id) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/reject/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed");
                return;
            }

            toast.success("Job rejected.");
            refreshJobs();

        } catch (err) {
            console.log(err);
            toast.error("Error rejecting job");
        }
    }


    async function cancelJob(id) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/cancel/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed");
                return;
            }

            toast.success("Job cancelled.");
            refreshJobs();

        } catch (err) {
            console.log(err);
            toast.error("Error cancelling job");
        }
    }

    return (
        <div className="tableWrapper">
            <table className="wdTable">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Payment</th>
                        <th>Price</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {jobs.map((j) => {
                        const jobAddress = getJobAddress(j);
                        const jobLocation = getJobLocation(j);

                        return (
                            <tr key={j._id}>
                                <td>{j.customer?.name || "N/A"}</td>
                                <td>{j.customer?.phone || "N/A"}</td>
                                <td>
                                    {jobAddress || "❌ No address provided"}

                                    {jobLocation?.lat && jobLocation?.lng && (
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            📍 {Number(jobLocation.lat).toFixed(4)}, {Number(jobLocation.lng).toFixed(4)}
                                        </div>
                                    )}

                                    {j.description && (
                                        <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
                                            {j.description}
                                        </div>
                                    )}

                                    {j.bookingMedia?.length > 0 && (
                                        <div className="jobMediaList">
                                            {j.bookingMedia.map((file, index) => (
                                                <a
                                                    key={`${file.name}-${index}`}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {file.type === "video" ? "Video" : "Photo"} {index + 1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td>{formatPayment(j.paymentType)}</td>
                                <td>
                                    <div>{formatEstimate(j)}</div>
                                    <small>{formatFinalPrice(j)}</small>
                                </td>
                                <td>{new Date(j.date).toLocaleDateString()}</td>
                                <td>{j.startTime}</td>

                                <td>
                                    <span className={`status ${j.status}`}>
                                        {j.status}
                                    </span>
                                    <div className="jobProgressMini">
                                        {formatProgress(j.progressStatus)}
                                    </div>
                                </td>

                                <td>


                                    {j.status === "available" && (
                                        <span style={{ color: "#777", fontWeight: "bold" }}>
                                            Open slot
                                        </span>
                                    )}

                                    {j.status === "pending" && (
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="acceptBtn" onClick={() => acceptJob(j._id)}>
                                                Accept
                                            </button>

                                            <button className="rejectBtn" onClick={() => rejectJob(j._id)}>
                                                Reject
                                            </button>
                                        </div>
                                    )}


                                    {(j.status === "confirmed" || j.status === "accepted") && (
                                        <div style={{ display: "grid", gap: 6 }}>
                                            {j.finalPrice?.status !== "accepted" && (
                                                <div className="quoteBox">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="Final price"
                                                        value={quoteData[j._id]?.amount || ""}
                                                        onChange={(e) =>
                                                            setQuoteData((prev) => ({
                                                                ...prev,
                                                                [j._id]: {
                                                                    ...prev[j._id],
                                                                    amount: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                    <input
                                                        placeholder="Note"
                                                        value={quoteData[j._id]?.note || ""}
                                                        onChange={(e) =>
                                                            setQuoteData((prev) => ({
                                                                ...prev,
                                                                [j._id]: {
                                                                    ...prev[j._id],
                                                                    note: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                    <button className="acceptBtn" onClick={() => sendFinalPrice(j._id)}>
                                                        Send Price
                                                    </button>
                                                </div>
                                            )}

                                            {j.finalPrice?.status === "accepted" && (
                                                <div className="progressActions">
                                                    <button type="button" onClick={() => updateProgress(j._id, "on_the_way")}>
                                                        On my way
                                                    </button>
                                                    <button type="button" onClick={() => updateProgress(j._id, "arrived")}>
                                                        Arrived
                                                    </button>
                                                    <button type="button" onClick={() => updateProgress(j._id, "work_started")}>
                                                        Started
                                                    </button>
                                                </div>
                                            )}

                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    className="completeBtn"
                                                    onClick={() => completeJob(j._id)}
                                                >
                                                    Complete
                                                </button>

                                                <button
                                                    className="cancelBtn"
                                                    onClick={() => cancelJob(j._id)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}


                                    {j.status === "completed" && (
                                        <span style={{ color: "green", fontWeight: "bold" }}>
                                            Done
                                        </span>
                                    )}


                                    {j.status === "rejected" && (
                                        <span style={{ color: "red" }}>
                                            Rejected
                                        </span>
                                    )}


                                    {j.status === "cancelled" && (
                                        <span style={{ color: "orange" }}>
                                            Cancelled
                                        </span>
                                    )}

                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}


function Card({ title, value }) {
    return (
        <div className="wdCard">
            <div>{title}</div>
            <h2>{value}</h2>
        </div>
    );
}

function Panel({ title, children }) {
    return (
        <div className="wdPanel">
            <h3>{title}</h3>
            {children}
        </div>
    );
}

function MessagesView() {
    const [messages, setMessages] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState("");
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(true);

    async function fetchMessages() {
        try {
            setLoading(true);
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/messages/worker", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to load messages");
                return;
            }

            const nextMessages = Array.isArray(data) ? data : [];
            setMessages(nextMessages);

            if (!selectedScheduleId && nextMessages.length) {
                setSelectedScheduleId(nextMessages[0].schedule?._id);
            }
        } catch (err) {
            console.log(err);
            toast.error("Error loading messages");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMessages();
    }, []);

    async function sendReply(e) {
        e.preventDefault();

        const text = reply.trim();
        if (!selectedScheduleId || !text) return;

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/messages/worker/${selectedScheduleId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to send reply");
                return;
            }

            setReply("");
            toast.success("Reply sent.");
            fetchMessages();
        } catch (err) {
            console.log(err);
            toast.error("Error sending reply");
        }
    }

    const threads = Object.values(
        messages.reduce((acc, message) => {
            const scheduleId = message.schedule?._id;
            if (!scheduleId) return acc;

            if (!acc[scheduleId]) {
                acc[scheduleId] = {
                    schedule: message.schedule,
                    customer: message.customer,
                    messages: [],
                };
            }

            acc[scheduleId].messages.push(message);
            return acc;
        }, {})
    );

    const selectedThread = threads.find((thread) => thread.schedule?._id === selectedScheduleId);

    if (loading) return <p>Loading messages...</p>;

    return (
        <div>
            <h1>Messages</h1>

            {threads.length === 0 ? (
                <Panel title="Conversations">
                    <p>No messages yet.</p>
                </Panel>
            ) : (
                <div className="messagesLayout">
                    <Panel title="Conversations">
                        <div className="threadList">
                            {threads.map((thread) => {
                                const lastMessage = thread.messages[thread.messages.length - 1];
                                const scheduleId = thread.schedule?._id;

                                return (
                                    <button
                                        key={scheduleId}
                                        type="button"
                                        onClick={() => setSelectedScheduleId(scheduleId)}
                                        className={`threadButton ${selectedScheduleId === scheduleId ? "active" : ""}`}
                                    >
                                        <b>{thread.customer?.name || "Customer"}</b>
                                        <div style={{ fontSize: 12 }}>{thread.customer?.phone || "No phone"}</div>
                                        <div style={{ fontSize: 12, color: "#666" }}>
                                            {thread.schedule?.service || "Service"} - {lastMessage?.text}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </Panel>

                    <Panel title={selectedThread?.customer?.name || "Conversation"}>
                        {selectedThread && (
                            <>
                                <div style={{ marginBottom: 10, fontSize: 13 }}>
                                    Phone: <b>{selectedThread.customer?.phone || "N/A"}</b>
                                </div>

                                <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                                    {selectedThread.messages.map((message) => (
                                        <div
                                            key={message._id}
                                            style={{
                                                justifySelf: message.sender?._id === localStorage.getItem("user_id") ? "end" : "start",
                                                maxWidth: "75%",
                                                background: message.sender?._id === localStorage.getItem("user_id") ? "#000" : "#f2f2f2",
                                                color: message.sender?._id === localStorage.getItem("user_id") ? "#FFD000" : "#111",
                                                padding: 10,
                                                borderRadius: 8,
                                            }}
                                        >
                                            <div>{message.text}</div>
                                            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                                                {message.sender?.name || "User"}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={sendReply} className="messageReplyForm">
                                    <input
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Write a reply..."
                                    />
                                    <button className="acceptBtn" type="submit">Send</button>
                                </form>
                            </>
                        )}
                    </Panel>
                </div>
            )}
        </div>
    );
}


function ProfileView() {
    const [experience, setExperience] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");

    const [items, setItems] = useState([]);

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [files, setFiles] = useState([]);
    const [verificationStatus, setVerificationStatus] = useState("not_submitted");
    const [verificationDocs, setVerificationDocs] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const userId = localStorage.getItem("user_id");
                const res = await fetch(`https://tazabeet-backend.vibenest.net/api/auth/worker/${userId}`);
                const data = await res.json();

                if (!res.ok) return;

                setExperience(data.worker?.experience || "");
                setProfilePhoto(data.worker?.profilePhoto || "");
                setItems(data.worker?.portfolio || []);
                setVerificationStatus(data.worker?.verificationStatus || "not_submitted");
                setVerificationDocs(data.worker?.verificationDocs || []);
            } catch (err) {
                console.log(err);
            }
        }

        loadProfile();
    }, []);

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function saveWorkerProfile(next = {}) {
        const nextExperience = next.experience ?? experience;
        const nextProfilePhoto = next.profilePhoto ?? profilePhoto;
        const nextItems = next.items ?? items;
        const nextVerificationDocs = next.verificationDocs ?? verificationDocs;

        try {
            setSaving(true);
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/auth/worker-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    experience: nextExperience,
                    profilePhoto: nextProfilePhoto,
                    portfolio: nextItems,
                    verificationDocs: nextVerificationDocs,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to save profile");
                return;
            }

            toast.success("Profile saved.");
            if (data.worker?.verificationStatus) setVerificationStatus(data.worker.verificationStatus);
        } catch (err) {
            console.log(err);
            toast.error("Error saving profile");
        } finally {
            setSaving(false);
        }
    }

    function saveExperience(val) {
        setExperience(val);
    }

    async function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image")) {
            toast.error("Profile photo must be an image");
            return;
        }

        const photo = await readFileAsDataUrl(file);
        setProfilePhoto(photo);
        saveWorkerProfile({ profilePhoto: photo });
    }

    function handleFileChange(e) {
        const selected = Array.from(e.target.files);

        const filtered = selected.filter(f =>
            f.type.startsWith("image") || f.type.startsWith("video")
        );

        setFiles(filtered);
    }

    async function handleVerificationDocs(e) {
        const selected = Array.from(e.target.files || []).filter((file) =>
            file.type.startsWith("image") || file.type === "application/pdf"
        );
        const docs = await Promise.all(selected.slice(0, 4).map(async (file) => ({
            name: file.name,
            type: file.type,
            url: await readFileAsDataUrl(file),
        })));

        setVerificationDocs(docs);
        saveWorkerProfile({ verificationDocs: docs });
    }

    async function addPortfolio(e) {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        const media = await Promise.all(files.map(async (file) => ({
            name: file.name,
            type: file.type,
            url: await readFileAsDataUrl(file),
        })));

        const newItem = {
            id: Date.now(),
            title,
            desc,
            media,
            createdAt: new Date().toISOString(),
        };

        const updated = [newItem, ...items];

        setItems(updated);
        saveWorkerProfile({ items: updated });

        setTitle("");
        setDesc("");
        setFiles([]);
    }

    function removeItem(id) {
        const updated = items.filter((item) => (item.id || item._id) !== id);
        setItems(updated);
        saveWorkerProfile({ items: updated });
    }

    return (
        <div>
            <h1>Profile</h1>

            <NotificationsPanel />

            <Panel title="Worker Verification">
                <div className={`verifiedBadge ${verificationStatus === "verified" ? "ok" : ""}`}>
                    Status: {verificationStatus.replace("_", " ")}
                </div>
                <p>Upload your ID, license, or certificate. Admin must verify you before you can accept jobs.</p>
                <input type="file" multiple accept="image/*,application/pdf" onChange={handleVerificationDocs} />
                {verificationDocs.length > 0 && (
                    <div className="jobMediaList">
                        {verificationDocs.map((doc, index) => (
                            <a key={`${doc.name}-${index}`} href={doc.url} target="_blank" rel="noreferrer">
                                {doc.name || `Document ${index + 1}`}
                            </a>
                        ))}
                    </div>
                )}
            </Panel>

            <Panel title="Profile Photo">
                <div className="workerPhotoEditor">
                    <div className="workerProfilePhoto">
                        {profilePhoto ? (
                            <img src={profilePhoto} alt="Worker profile" />
                        ) : (
                            <span>{localStorage.getItem("customer_name")?.charAt(0) || "W"}</span>
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </div>
            </Panel>

            <Panel title="Experience">
                <textarea
                    value={experience}
                    onChange={(e) => saveExperience(e.target.value)}
                    placeholder="Write your experience..."
                />
                <button type="button" onClick={() => saveWorkerProfile()} disabled={saving}>
                    {saving ? "Saving..." : "Save Experience"}
                </button>
            </Panel>

            <Panel title="Add Portfolio">
                <form onSubmit={addPortfolio}>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
                    <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />

                    {files.length > 0 && (
                        <div className="previewGrid">
                            {files.map((file, i) =>
                                file.type.startsWith("video") ? (
                                    <video key={i} src={URL.createObjectURL(file)} controls />
                                ) : (
                                    <img key={i} src={URL.createObjectURL(file)} alt="" />
                                )
                            )}
                        </div>
                    )}

                    <button type="submit">Add to Portfolio</button>
                </form>
            </Panel>

            <Panel title="My Portfolio">
                {items.length === 0 ? (
                    <p>No portfolio yet</p>
                ) : (
                    <div className="portfolioGrid">
                        {items.map((item) => (
                            <div key={item.id || item._id} className="portfolioCard">
                                <h4>{item.title}</h4>
                                {item.desc && <p>{item.desc}</p>}

                                <div className="portfolioMedia">
                                    {item.media.map((m, i) => {
                                        const mediaUrl = typeof m === "string" ? m : m.url;
                                        const mediaType = typeof m === "string" ? "" : m.type;

                                        return mediaType.startsWith("video") ? (
                                            <video key={i} src={mediaUrl} controls />
                                        ) : (
                                            <img key={i} src={mediaUrl} alt="" />
                                        );
                                    })}
                                </div>

                                <button className="deleteBtn" onClick={() => removeItem(item.id || item._id)}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </div>
    );
}
