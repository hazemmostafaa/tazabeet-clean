import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CustomerDashboard() {
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    }

    return (
        <div style={{ padding: 30, fontFamily: "system-ui" }}>
            <h1 style={{ margin: 0 }}>Customer Dashboard</h1>
            <p style={{ opacity: 0.7 }}>Welcome! (We will add booking + appointments here next)</p>

            <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                    onClick={() => toast.info("Booking page coming next.")}
                    style={{
                        background: "#000",
                        color: "#FFD000",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 900,
                    }}
                >
                    Book Appointment
                </button>

                <button
                    onClick={() => navigate("/")}
                    style={{
                        background: "#FFD000",
                        color: "#000",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 900,
                    }}
                >
                    Back to Home
                </button>

                <button
                    onClick={logout}
                    style={{
                        background: "transparent",
                        color: "#000",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        fontWeight: 900,
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
