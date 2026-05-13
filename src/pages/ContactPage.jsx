import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";
import logo from "../assets/logo.png";
import SiteFooter from "../components/SiteFooter";
import { useDashboardLanguage } from "../utils/dashboardI18n";

export default function ContactPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, isArabic, setLanguage, t } = useDashboardLanguage();
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
            toast.error(t("contactPage.fillAll"));
            return;
        }

        toast.success(t("contactPage.received"));
        setForm({ name: "", email: "", message: "" });
    }

    return (
        <div className={`lp ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
            <div className="lpTopLanding">
                <button className="lpBrand" type="button" onClick={() => navigate("/")}>
                    <img src={logo} alt="logo" className="lpLogo" />
                    <span className="lpBrandName">TAZABEET</span>
                </button>

                <div className="lpDesktopNav">
                    <button type="button" onClick={() => navigate("/")}>{t("site.home")}</button>
                    <button type="button" onClick={() => navigate("/services")}>{t("site.services")}</button>
                    <button type="button" onClick={() => navigate("/ai-chat")}>{t("site.aiChat")}</button>
                    <button type="button" className="active" onClick={() => navigate("/contact")}>{t("site.contact")}</button>
                </div>

                <div className="lpTopBtns">
                    <button
                        type="button"
                        className="dashboardLangToggle"
                        onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                    >
                        🌐 {t("common.languageToggle")}
                    </button>
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
                    <div className="lpLoc">{t("contactPage.support")}</div>
                    <div className="lpTitle">
                        <div className="lpTitleA">{t("contactPage.titleA")}</div>
                        <div className="lpTitleB">TAZABEET</div>
                    </div>
                </div>
            </div>

            <div className="lpBody">
                <div className="contactGrid">
                    <section className="contactPanel">
                        <h2>{t("contactPage.talk")}</h2>
                        <p>{t("contactPage.text")}</p>

                        <div className="contactInfo">
                            <div>
                                <b>{t("contactPage.phone")}</b>
                                <span>+20 100 123 4567</span>
                            </div>
                            <div>
                                <b>{t("contactPage.email")}</b>
                                <span>help@tazabeet.com</span>
                            </div>
                            <div>
                                <b>{t("contactPage.location")}</b>
                                <span>{t("landing.location")}</span>
                            </div>
                        </div>
                    </section>

                    <form className="contactForm" onSubmit={submitContact}>
                        <label>{t("contactPage.name")}</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder={t("contactPage.yourName")}
                        />

                        <label>{t("contactPage.email")}</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="name@example.com"
                        />

                        <label>{t("contactPage.message")}</label>
                        <textarea
                            value={form.message}
                            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                            placeholder={t("contactPage.messagePlaceholder")}
                            rows={6}
                        />

                        <button type="submit">{t("contactPage.send")}</button>
                    </form>
                </div>
            </div>

            <SiteFooter language={language} t={t} />

            <div className={`mobileNav ${showNav ? "show" : "hide"}`}>
                <button className={location.pathname === "/" ? "active" : ""} onClick={() => navigate("/")}>
                    <span>🏠</span>
                    <p>{t("site.home")}</p>
                </button>
                <button className={location.pathname === "/services" ? "active" : ""} onClick={() => navigate("/services")}>
                    <span>🧰</span>
                    <p>{t("site.services")}</p>
                </button>
                <button className={location.pathname === "/ai-chat" ? "active" : ""} onClick={() => navigate("/ai-chat")}>
                    <span>💬</span>
                    <p>{t("site.chat")}</p>
                </button>
                <button className={location.pathname === "/contact" ? "active" : ""} onClick={() => navigate("/contact")}>
                    <span>📞</span>
                    <p>{t("site.contact")}</p>
                </button>
            </div>
        </div>
    );
}
