import React from "react";
import { useNavigate } from "react-router-dom";
import { SocialIcon } from "react-social-icons";

const socialLinks = [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Twitter", href: "https://twitter.com" },
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
                        <SocialIcon
                            key={link.label}
                            url={link.href}
                            className="footerSocialIcon"
                            target="_blank"
                            rel="noreferrer"
                            aria-label={link.label}
                            bgColor="#333"
                            fgColor="#fff"
                            style={{ width: 50, height: 50 }}
                        />
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
