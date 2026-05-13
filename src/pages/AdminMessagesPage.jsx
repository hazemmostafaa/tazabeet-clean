import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminMessagesPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    useEffect(() => {
        async function fetchMessages() {
            try {
                const res = await fetch("https://tazabeet-backend.vibenest.net/api/messages/admin", {
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

        fetchMessages();
    }, []);

    if (role !== "admin") return <Navigate to="/" replace />;

    return (
        <div style={{ padding: 24, fontFamily: "system-ui", background: "#f6f6f6", minHeight: "100vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h1>Admin Messages</h1>
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    style={{
                        background: "#000",
                        color: "#FFD000",
                        border: "none",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Home
                </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, padding: 16 }}>
                {loading ? (
                    <p>Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p>No messages yet.</p>
                ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                        {messages.map((message) => (
                            <div
                                key={message._id}
                                style={{
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                    padding: 12,
                                }}
                            >
                                <div style={{ fontWeight: "bold" }}>
                                    {message.customer?.name || "Customer"} to {message.worker?.name || "Worker"}
                                </div>
                                <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
                                    Service: {message.schedule?.service || "N/A"} | Sender: {message.sender?.name || "User"}
                                </div>
                                <div>{message.text}</div>
                                <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                                    {new Date(message.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
