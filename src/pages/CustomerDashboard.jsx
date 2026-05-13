import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDashboardLanguage } from "../utils/dashboardI18n";

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const { language, isArabic, setLanguage, t } = useDashboardLanguage();

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    }

    return (
        <div style={{ padding: 30, fontFamily: "system-ui" }} dir={isArabic ? "rtl" : "ltr"}>
            <button
                type="button"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                style={{
                    border: "1px solid #ddd",
                    background: "#fff",
                    borderRadius: 999,
                    padding: "8px 12px",
                    fontWeight: 900,
                    cursor: "pointer",
                    marginBottom: 16,
                }}
            >
                🌐 {t("common.languageToggle")}
            </button>
            <h1 style={{ margin: 0 }}>{t("customer.dashboardTitle")}</h1>
            <p style={{ opacity: 0.7 }}>{t("customer.dashboardWelcome")}</p>

            <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                    onClick={() => toast.info(t("customer.bookingComing"))}
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
                    {t("customer.bookAppointment")}
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
                    {t("customer.backHome")}
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
                    {t("customer.logout")}
                </button>
            </div>
        </div>
    );
}
