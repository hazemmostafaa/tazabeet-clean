import { useState } from "react";
import { api } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "./AuthPage.css";
import logo from "../assets/logo.png";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        setMsg("");

        if (password !== confirm) {
            setErr("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            await api.post(`/api/auth/reset-password/${token}`, {
                password,
            });

            setMsg("Password reset successful ✅");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            setErr(error?.response?.data?.message || "Invalid or expired token");
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
                <h1 className="title">Reset Password</h1>
                <p className="subtitle">Enter your new password</p>

                <section className="card">
                    {err && <div className="alert error">{err}</div>}
                    {msg && <div className="alert success">{msg}</div>}

                    <form className="form" onSubmit={submit}>
                        <label className="label">New Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <label className="label">Confirm Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Confirm password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />

                        <button className="primaryBtn" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password →"}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}