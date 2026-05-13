import { useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import "./AuthPage.css";
import logo from "../assets/logo.png";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setMsg("");
        setErr("");

        try {
            setLoading(true);

            const res = await api.post("/api/auth/forgot-password", {
                email: email.trim(),
            });

            setMsg(res.data?.message || "Reset link sent to your email.");

        } catch (error) {
            const backendMessage = error?.response?.data?.message;

            if (backendMessage) {
                setErr(backendMessage);
            } else if (error?.code === "ECONNABORTED") {
                setErr("The email server took too long to respond. Check the backend email settings and VibeNest logs.");
            } else if (!error?.response) {
                setErr("Cannot reach the backend right now. Check that the backend is running and deployed.");
            } else {
                setErr(`Server error ${error.response.status}. Check the backend logs.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authPage">
            <header className="authHeader">
                <img src={logo} alt="logo" className="lpLogo" />
                <div className="brand">TAZABEET</div>
            </header>

            <main className="authMain">
                <h1 className="title">Forgot Password</h1>
                <p className="subtitle">Enter your email to reset your password</p>

                <section className="card">
                    {err && <div className="alert error">{err}</div>}
                    {msg && <div className="alert success">{msg}</div>}


                    <form className="form" onSubmit={submit}>
                        <label className="label">Email Address</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <button className="primaryBtn" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link →"}
                        </button>
                    </form>

                    <p className="bottomText">
                        Remember your password?{" "}
                        <Link to="/login" className="linkBtn">
                            Back to Login
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    );
}
