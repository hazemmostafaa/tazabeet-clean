import React from "react";
import { useNavigate } from "react-router-dom";

const socialLinks = [
    { label: "Website", icon: "🌐", href: "https://tazabeet.netlify.app" },
    { label: "Instagram", icon: "📸", href: "https://instagram.com" },
    { label: "Facebook", icon: "📘", href: "https://facebook.com" },
];

export default function SiteFooter() {
    const navigate = useNavigate();

    return (
        <>
            <div className="lpFooterSpace" aria-hidden="true" />
            <footer className="footer">
                <h2>TAZABEET</h2>
                <p>Your trusted partner for home services in Alexandria.</p>

                <div className="footerIcons" aria-label="Social links">
                    {socialLinks.map((link) => (
                        <a
                            key={link.label}
                            className="footerIconButton"
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={link.label}
                        >
                            <span aria-hidden="true">{link.icon}</span>
                        </a>
                    ))}
                </div>

                <div className="footerGrid">
                    <div>
                        <h4>Quick Links</h4>
                        <button className="footerLink" type="button" onClick={() => navigate("/")}>
                            Home
                        </button>
                        <button className="footerLink" type="button" onClick={() => navigate("/services")}>
                            Services
                        </button>
                        <button className="footerLink" type="button" onClick={() => navigate("/ai-chat")}>
                            AI Assistant
                        </button>
                    </div>

                    <div>
                        <h4>Contact</h4>
                        <p>📍 Alexandria</p>
                        <p>📞 +20 100 123 4567</p>
                        <p>✉ help@tazabeet.com</p>
                    </div>
                </div>

                <div className="footerBottom">
                    © 2026 TAZABEET — Designed with ❤️ in Alexandria
                </div>
            </footer>
        </>
    );
}
