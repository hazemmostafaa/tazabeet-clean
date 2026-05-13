import React, { useEffect, useMemo, useState } from "react";
import "./InstallPwaPrompt.css";
import { useDashboardLanguage } from "../utils/dashboardI18n";

const DISMISS_KEY = "tazabeet_install_prompt_dismissed";

function isStandalone() {
    return (
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        window.navigator.standalone === true
    );
}

function isMobileDevice() {
    return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent || "");
}

function isIosDevice() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent || "");
}

export default function InstallPwaPrompt() {
    const { t, isArabic } = useDashboardLanguage();
    const [installEvent, setInstallEvent] = useState(null);
    const [visible, setVisible] = useState(false);

    const canShowIosHelp = useMemo(() => isIosDevice(), []);

    useEffect(() => {
        if (isStandalone() || !isMobileDevice() || localStorage.getItem(DISMISS_KEY) === "1") {
            return;
        }

        const handleInstallPrompt = (event) => {
            event.preventDefault();
            setInstallEvent(event);
            setVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handleInstallPrompt);

        const fallbackTimer = window.setTimeout(() => {
            if (canShowIosHelp && !isStandalone()) {
                setVisible(true);
            }
        }, 2500);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
            window.clearTimeout(fallbackTimer);
        };
    }, [canShowIosHelp]);

    async function installApp() {
        if (!installEvent) return;

        installEvent.prompt();
        await installEvent.userChoice;
        setInstallEvent(null);
        setVisible(false);
    }

    function dismiss() {
        localStorage.setItem(DISMISS_KEY, "1");
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div className={`installPrompt ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
            <button className="installPromptClose" type="button" onClick={dismiss} aria-label={t("common.cancel")}>
                ×
            </button>
            <div className="installPromptIcon">🏠</div>
            <div className="installPromptText">
                <b>{t("pwa.title")}</b>
                <span>{installEvent ? t("pwa.androidText") : t("pwa.iosText")}</span>
            </div>
            {installEvent ? (
                <button className="installPromptAction" type="button" onClick={installApp}>
                    {t("pwa.install")}
                </button>
            ) : null}
        </div>
    );
}
