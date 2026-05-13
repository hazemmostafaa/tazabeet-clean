import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";
import logo from "../assets/logo.png";

export default function ContactPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showNav, setShowNav] = useState(true);
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    useEffect(() => {
        let lastScroll = window.scrollY;

        const handleScroll = () => {
            const currentScroll = window.scrollY;
            setShowNav(currentScroll <= lastScroll);
            lastScroll = currentScroll;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    function submitContact(e) {
        e.preventDefault();

        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            toast.error("Please fill in all contact fields.");
            return;
        }

        toast.success("Thanks. We received your message.");
        setForm({ name: "", email: "", message: "" });
    }

    return (
        <div className="lp">
            <div className="lpTopLanding">
                <button className="lpBrand" type="button" onClick={() => navigate("/")}>
                    <img src={logo} alt="logo" className="lpLogo" />
                    <span className="lpBrandName">TAZABEET</span>
                </button>

                <div className="lpDesktopNav">
                    <button type="button" onClick={() => navigate("/")}>Home</button>
                    <button type="button" onClick={() => navigate("/services")}>Services</button>
                    <button type="button" onClick={() => navigate("/ai-chat")}>AI Chat</button>
                    <button type="button" className="active" onClick={() => navigate("/contact")}>Contact</button>
                </div>

                <div className="lpTopBtns">
                    <button
                        className="lpProfileBtn"
                        type="button"
                        onClick={() => navigate(localStorage.getItem("role") === "customer" ? "/customer-profile" : "/login")}
                    >
                        <span className="lpProfileCircle">👤</span>
                    </button>
                </div>
            </div>

            <div className="lpHero">
                <div className="lpHeroInner">
                    <div className="lpLoc">Alexandria support team</div>
                    <div className="lpTitle">
                        <div className="lpTitleA">Contact</div>
                        <div className="lpTitleB">TAZABEET</div>
                    </div>
                </div>
            </div>

            <div className="lpBody">
                <div className="contactGrid">
                    <section className="contactPanel">
                        <h2>Talk to us</h2>
                        <p>Questions, support, partnership requests, or service issues can all come through here.</p>

                        <div className="contactInfo">
                            <div>
                                <b>Phone</b>
                                <span>+20 100 123 4567</span>
                            </div>
                            <div>
                                <b>Email</b>
                                <span>help@tazabeet.com</span>
                            </div>
                            <div>
                                <b>Location</b>
                                <span>Alexandria, Egypt</span>
                            </div>
                        </div>
                    </section>

                    <form className="contactForm" onSubmit={submitContact}>
                        <label>Name</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Your name"
                        />

                        <label>Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="name@example.com"
                        />

                        <label>Message</label>
                        <textarea
                            value={form.message}
                            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                            placeholder="How can we help?"
                            rows={6}
                        />

                        <button type="submit">Send Message</button>
                    </form>
                </div>
            </div>

            <div className="footer">
                <h2>TAZABEET</h2>
                <p>Your trusted partner for home services in Alexandria.</p>

                <div className="footerGrid">
                    <div>
                        <h4>Quick Links</h4>
                        <p onClick={() => navigate("/")}>Home</p>
                        <p onClick={() => navigate("/services")}>Services</p>
                        <p onClick={() => navigate("/ai-chat")}>AI Assistant</p>
                    </div>

                    <div>
                        <h4>Contact</h4>
                        <p>📍 Alexandria</p>
                        <p>📞 +20 100 123 4567</p>
                        <p>✉ help@tazabeet.com</p>
                    </div>
                </div>

                <div className="footerBottom">
                    © 2026 TAZABEET
                </div>
            </div>

            <div className={`mobileNav ${showNav ? "show" : "hide"}`}>
                <button className={location.pathname === "/" ? "active" : ""} onClick={() => navigate("/")}>
                    <span>🏠</span>
                    <p>Home</p>
                </button>
                <button className={location.pathname === "/services" ? "active" : ""} onClick={() => navigate("/services")}>
                    <span>🧰</span>
                    <p>Services</p>
                </button>
                <button className={location.pathname === "/ai-chat" ? "active" : ""} onClick={() => navigate("/ai-chat")}>
                    <span>💬</span>
                    <p>Chat</p>
                </button>
                <button className={location.pathname === "/contact" ? "active" : ""} onClick={() => navigate("/contact")}>
                    <span>📞</span>
                    <p>Contact</p>
                </button>
            </div>
        </div>
    );
}
