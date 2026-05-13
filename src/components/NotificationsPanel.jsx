import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function NotificationsPanel() {
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
            if (!res.ok) return toast.error("Failed to mark notifications read");
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
                <h3>Notifications {unreadCount ? `(${unreadCount})` : ""}</h3>
                <button type="button" onClick={markAllRead}>Mark all read</button>
            </div>

            {items.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                <div className="notifyList">
                    {items.slice(0, 8).map((item) => (
                        <div key={item._id} className={`notifyItem ${item.read ? "" : "unread"}`}>
                            <b>{item.title}</b>
                            {item.body && <span>{item.body}</span>}
                            <small>{new Date(item.createdAt).toLocaleString()}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
