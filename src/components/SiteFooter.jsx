import React from "react";
import { useNavigate } from "react-router-dom";
import { SocialIcon } from "react-social-icons";
import { translate, useDashboardLanguage } from "../utils/dashboardI18n";

const socialLinks = [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Twitter", href: "https://twitter.com" },
];

export default function SiteFooter({ language: languageProp, t: tProp }) {
    const navigate = useNavigate();
    const languageState = useDashboardLanguage();
    const language = languageProp || languageState.language;
    const t = tProp || ((key, params) => translate(language, key, params));

    return (
        <>
            <div className="lpFooterSpace" aria-hidden="true" />
            <footer className="footer">
                <h2>TAZABEET</h2>
                <p>{t("footer.tagline")}</p>

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
                        <h4>{t("footer.quickLinks")}</h4>
                        <button className="footerLink" type="button" onClick={() => navigate("/")}>
                            {t("site.home")}
                        </button>
                        <button className="footerLink" type="button" onClick={() => navigate("/services")}>
                            {t("site.services")}
                        </button>
                        <button className="footerLink" type="button" onClick={() => navigate("/ai-chat")}>
                            {t("footer.aiAssistant")}
                        </button>
                    </div>

                    <div>
                        <h4>{t("footer.contact")}</h4>
                        <p>📍 {t("footer.alexandria")}</p>
                        <p>📞 +20 100 123 4567</p>
                        <p>✉ help@tazabeet.com</p>
                    </div>
                </div>

                <div className="footerBottom">
                    {t("footer.bottom")}
                </div>
            </footer>
        </>
    );
}
