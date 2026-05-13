import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    dashboardLocale,
    getStoredDashboardLanguage,
    translate,
    translateDashboardText,
} from "../utils/dashboardI18n";

export default function NotificationsPanel({ language: languageProp, t: tProp }) {
    const language = languageProp || getStoredDashboardLanguage();
    const t = tProp || ((key, params) => translate(language, key, params));
    const [items, setItems] = useState([]);
    const unreadCount = items.filter((item) => !item.read).length;

    async function fetchNotifications() {
        try {
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/notifications", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            });
            const data = await res.json();
            if (!res.ok) return;
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
        }
    }

    async function markAllRead() {
        try {
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/notifications/read-all", {
                method: "PUT",
                headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            });
            if (!res.ok) return toast.error(t("notifications.markFailed"));
            fetchNotifications();
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="notifyPanel">
            <div className="notifyHeader">
                <h3>{t("notifications.title")} {unreadCount ? `(${unreadCount})` : ""}</h3>
                <button type="button" onClick={markAllRead}>{t("notifications.markAllRead")}</button>
            </div>

            {items.length === 0 ? (
                <p>{t("notifications.empty")}</p>
            ) : (
                <div className="notifyList">
                    {items.slice(0, 8).map((item) => (
                        <div key={item._id} className={`notifyItem ${item.read ? "" : "unread"}`}>
                            <b>{translateDashboardText(language, item.title)}</b>
                            {item.body && <span>{translateDashboardText(language, item.body)}</span>}
                            <small>{new Date(item.createdAt).toLocaleString(dashboardLocale(language))}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
