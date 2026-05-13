
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import "./AuthPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function AuthPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });


  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "worker",
    job: "",
  });

  const isWorker = useMemo(() => signupForm.role === "worker", [signupForm.role]);

  function resetAlerts() {
    setError("");
    setSuccess("");
  }

  function switchTab(nextTab) {
    resetAlerts();
    setTab(nextTab);
  }


  useEffect(() => {
    const st = location.state;
    if (!st) return;

    if (st.tab) setTab(st.tab);

    if (st.role) {
      setSignupForm((p) => ({ ...p, role: st.role }));
    }


  }, [location.state]);

  async function handleLogin(e) {
    e.preventDefault();
    resetAlerts();

    const email = loginForm.email.trim();
    if (!email || !loginForm.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", {
        email,
        password: loginForm.password,
      });

      const token = res.data?.token;
      const role = res.data?.user?.role || res.data?.role;
      const user = res.data?.user;

      if (user) {
        localStorage.setItem("customer_name", user.name);
        localStorage.setItem("customer_email", user.email);
        localStorage.setItem("customer_phone", user.phone || "");
        localStorage.setItem("user_id", user._id || user.id);
      }
      if (token) localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);
      localStorage.setItem("last_activity", String(Date.now()));

      setSuccess("Logged in successfully!");


      if (role === "worker") {
        navigate("/worker-dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {

        navigate("/");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    resetAlerts();

    const name = signupForm.name.trim();
    const email = signupForm.email.trim();
    const phone = signupForm.phone.trim();

    if (!name || !email || !phone || !signupForm.password || !signupForm.role) {
      setError("Please fill all required fields.");
      return;
    }

    if (signupForm.role === "worker" && !signupForm.job.trim()) {
      setError("Please enter the worker job.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/auth/register", {
        name,
        email,
        phone,
        password: signupForm.password,
        role: signupForm.role,
        job: signupForm.role === "worker" ? signupForm.job.trim() : undefined,
      });

      setSuccess("Account created! You can log in now.");
      setTab("login");
      setLoginForm((prev) => ({ ...prev, email }));
    } catch (err) {
      const msg = err?.response?.data?.message || "Sign up failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authPage">
      <header className="authHeader">
        <img src={logo} alt="logo" className="lpLogo" />
        <div className="brand">TAZABEET</div>
      </header>

      <main className="authMain">
        <h1 className="title">Welcome Back</h1>
        <p className="subtitle">
          {tab === "login" ? "Log in to your account" : "Create your account"}
        </p>

        <section className="card">
          <div className="tabs">
            <button
              className={`tabBtn ${tab === "login" ? "active" : ""}`}
              onClick={() => switchTab("login")}
              type="button"
            >
              Log In
            </button>
            <button
              className={`tabBtn ${tab === "signup" ? "active" : ""}`}
              onClick={() => switchTab("signup")}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <div className="divider" />

          {error ? <div className="alert error">{error}</div> : null}
          {success ? <div className="alert success">{success}</div> : null}

          {tab === "login" ? (
            <form className="form" onSubmit={handleLogin}>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="name@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
              />

              <div className="rowBetween">
                <label className="label">Password</label>
                <button
                  className="linkBtn"
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>

              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
              />


              <button className="primaryBtn" disabled={loading} type="submit">
                {loading ? "Logging in..." : "Login →"}
              </button>

              <p className="bottomText">
                New to Tazabeet?{" "}
                <button className="linkBtn" type="button" onClick={() => switchTab("signup")}>
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form className="form" onSubmit={handleSignup}>
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="Your name"
                value={signupForm.name}
                onChange={(e) => setSignupForm((p) => ({ ...p, name: e.target.value }))}
              />

              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="name@example.com"
                value={signupForm.email}
                onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))}
              />

              <label className="label">Phone Number</label>
              <input
                className="input"
                type="tel"
                placeholder="Your phone number"
                value={signupForm.phone}
                onChange={(e) => setSignupForm((p) => ({ ...p, phone: e.target.value }))}
              />

              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Create a password"
                value={signupForm.password}
                onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))}
              />

              <label className="label">Role</label>
              <select
                className="input"
                value={signupForm.role}
                onChange={(e) => setSignupForm((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="customer">Customer</option>
                <option value="worker">Worker</option>
              </select>

              {isWorker && (
                <>
                  <label className="label">Worker Job</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. Electrician, Plumber..."
                    value={signupForm.job}
                    onChange={(e) => setSignupForm((p) => ({ ...p, job: e.target.value }))}
                  />
                </>
              )}

              <button className="primaryBtn" disabled={loading} type="submit">
                {loading ? "Creating..." : "Create account →"}
              </button>

              <p className="bottomText">
                Already have an account?{" "}
                <button className="linkBtn" type="button" onClick={() => switchTab("login")}>
                  Log in
                </button>
              </p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
