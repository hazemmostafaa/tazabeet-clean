import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";
import NotificationsPanel from "../components/NotificationsPanel";
import {
    dashboardLocale,
    formatCurrency,
    formatServiceName,
    translateDashboardText,
    translateStatus,
    useDashboardLanguage,
} from "../utils/dashboardI18n";
function StarRating({ value, onChange }) {
    return (
        <div style={{ display: "flex", gap: 6, cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => onChange(star)}
                    style={{
                        fontSize: 20,
                        color: star <= value ? "#FFD700" : "#ccc",
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}
export default function CustomerProfile() {
    const navigate = useNavigate();
    const { language, isArabic, setLanguage, t } = useDashboardLanguage();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [ratingData, setRatingData] = useState({});
    const [openMessages, setOpenMessages] = useState("");
    const [reportData, setReportData] = useState({});
    const [favorites, setFavorites] = useState([]);

    const userName = localStorage.getItem("customer_name") || t("common.customer");
    const userEmail = localStorage.getItem("customer_email") || "example@email.com";
    const userPhone = localStorage.getItem("customer_phone") || t("common.notAvailable");


    async function fetchJobs() {
        try {
            setLoading(true);
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/schedule/customer", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();

            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchJobs();
        fetchFavorites();
        const interval = setInterval(fetchJobs, 8000);
        return () => clearInterval(interval);
    }, []);

    async function fetchFavorites() {
        try {
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/customer/favorites", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            });
            const data = await res.json();
            if (res.ok) setFavorites(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
        }
    }


    function handleRatingChange(id, field, value) {
        setRatingData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    }


    async function submitRating(id) {
        const current = ratingData[id];

        if (!current?.rating) {
            toast.error(t("toasts.selectRating"));
            return;
        }

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/rate/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    rating: current.rating,
                    review: current.review || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.submitRatingFailed"));
                return;
            }

            toast.success(t("toasts.ratingSubmitted"));
            window.location.reload();

        } catch (err) {
            console.log(err);
            toast.error(t("toasts.submitRatingError"));
        }
    }

    async function respondToQuote(id, decision) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/quote/${id}/${decision}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.priceResponseFailed"));
                return;
            }

            toast.success(data.message);
            fetchJobs();
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.priceResponseError"));
        }
    }

    async function submitReport(jobId) {
        const current = reportData[jobId] || {};
        if (!current.reason) return toast.error(t("toasts.chooseReportReason"));

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/complaints/${jobId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    reason: current.reason,
                    details: current.details || "",
                }),
            });
            const data = await res.json();
            if (!res.ok) return toast.error(data.message || t("toasts.reportFailed"));
            toast.success(t("toasts.reportSent"));
            setReportData((prev) => ({ ...prev, [jobId]: { reason: "", details: "" } }));
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.reportError"));
        }
    }

    function renderPricing(job) {
        return (
            <div style={{
                marginTop: 10,
                background: "#fff8c9",
                border: "1px solid #FFD000",
                borderRadius: 10,
                padding: 10,
            }}>
                {job.estimatedPrice?.min && (
                    <div>
                        {t("customer.estimate")}: <b>{job.estimatedPrice.min} - {job.estimatedPrice.max} {formatCurrency(language, job.estimatedPrice.currency)}</b>
                    </div>
                )}

                {job.finalPrice?.amount ? (
                    <div style={{ marginTop: 6 }}>
                        {t("customer.finalPrice")}: <b>{job.finalPrice.amount} {formatCurrency(language, job.finalPrice.currency)}</b>
                        <div>{t("customer.status")}: <b>{translateStatus(language, job.finalPrice.status)}</b></div>
                        {job.finalPrice.note && <div>{t("customer.note")}: {job.finalPrice.note}</div>}

                        {job.finalPrice.status === "pending" && (
                            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    onClick={() => respondToQuote(job._id, "accept")}
                                    style={{
                                        background: "#000",
                                        color: "#FFD000",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                    }}
                                >
                                    {t("customer.acceptPrice")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => respondToQuote(job._id, "decline")}
                                    style={{
                                        background: "#f1f1f1",
                                        color: "#111",
                                        border: "1px solid #ddd",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                    }}
                                >
                                    {t("customer.decline")}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ marginTop: 6, color: "#666" }}>
                        {t("customer.waitingFinalPrice")}
                    </div>
                )}
            </div>
        );
    }

    function renderTimeline(job) {
        const existing = Array.isArray(job.timeline) ? job.timeline : [];
        const timeline = existing.length
            ? existing
            : [
                {
                    key: job.status,
                    label: job.status === "pending" ? t("customer.bookingRequested") : translateStatus(language, job.status),
                    createdAt: job.createdAt || job.date,
                },
            ];

        return (
            <div className="bookingTimeline">
                <h4>{t("customer.bookingTimeline")}</h4>
                {timeline.map((event, index) => (
                    <div className="timelineItem" key={`${event.key}-${event.createdAt}-${index}`}>
                        <span className="timelineDot" />
                        <div>
                            <b>{translateDashboardText(language, event.label || event.key)}</b>
                            {event.note && <p>{translateDashboardText(language, event.note)}</p>}
                            {event.createdAt && (
                                <small>{new Date(event.createdAt).toLocaleString(dashboardLocale(language))}</small>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    function logout() {
        localStorage.clear();
        navigate("/", { replace: true });
        window.location.reload();
    }

    return (
        <div className={`lp customerProfilePage ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
            <div className="lpTopLanding customerProfileTop">
                <h1>{t("customer.profile")}</h1>
                <div className="profileTopActions">
                    <button
                        type="button"
                        className="dashboardLangToggle profileLangToggle"
                        onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                    >
                        🌐 {t("common.languageToggle")}
                    </button>
                    <button onClick={logout} className="profileLogoutBtn">
                        {t("customer.logout")}
                    </button>
                </div>
            </div>
            <div className="customerProfileBody">
            <div style={{
                marginTop: 16,
                background: "#fff",
                padding: 16,
                borderRadius: 14,
                boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
            }}>
                <h3>{t("customer.accountInfo")}</h3>
                <div>{t("customer.name")}: <b>{userName}</b></div>
                <div>{t("customer.email")}: <b>{userEmail}</b></div>
                <div>{t("customer.phone")}: <b>{userPhone}</b></div>
            </div>

            <NotificationsPanel language={language} t={t} />

            <div style={{
                marginTop: 18,
                background: "#fff",
                padding: 16,
                borderRadius: 14,
            }}>
                <h3>{t("customer.favoriteWorkers")}</h3>
                {favorites.length === 0 ? (
                    <p>{t("customer.noFavoriteWorkers")}</p>
                ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                        {favorites.map((worker) => (
                            <button
                                key={worker._id}
                                type="button"
                                onClick={() => navigate(`/worker/${worker._id}`)}
                                style={{
                                    textAlign: isArabic ? "right" : "left",
                                    border: "1px solid #eee",
                                    background: "#fff8c9",
                                    borderRadius: 10,
                                    padding: 10,
                                    cursor: "pointer",
                                }}
                            >
                                <b>{worker.name}</b>
                                <div>⭐ {worker.rating || 0} ({worker.totalReviews || 0})</div>
                            </button>
                        ))}
                    </div>
                )}
            </div>


            <div style={{
                marginTop: 18,
                background: "#fff",
                padding: 16,
                borderRadius: 14,
            }}>
                <h3>{t("customer.myBookings")}</h3>

                {loading ? t("common.loading") :
                    jobs.filter(j => j.status !== "completed").length === 0 ? (
                        <p>{t("customer.noActiveBookings")}</p>
                    ) : (
                        jobs
                            .filter(j => j.status !== "completed")
                            .map(j => (
                                <div key={j._id} style={{
                                    border: "1px solid #eee",
                                    padding: 12,
                                    borderRadius: 10,
                                    marginBottom: 10
                                }}>
                                    <b>{formatServiceName(language, j.service)}</b>
                                    <div>{t("customer.worker")}: {j.worker?.name || t("common.notAvailable")}</div>
                                    <div>{t("customer.workerPhone")}: {j.worker?.phone || t("common.notAvailable")}</div>
                                    <div>📅 {new Date(j.date).toLocaleDateString(dashboardLocale(language))}</div>
                                    {j.description && <div>{t("customer.issue")}: {j.description}</div>}
                                    {renderPricing(j)}
                                    {renderTimeline(j)}

                                    <div style={{
                                        marginTop: 6,
                                        fontWeight: "bold",
                                        color:
                                            j.status === "confirmed"
                                                ? "green"
                                                : j.status === "pending"
                                                    ? "orange"
                                                    : "red"
                                    }}>
                                        {translateStatus(language, j.status)}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setOpenMessages(openMessages === j._id ? "" : j._id)}
                                        style={{
                                            marginTop: 10,
                                            background: "#000",
                                            color: "#FFD000",
                                            border: "none",
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {t("customer.messages")}
                                    </button>

                                    {openMessages === j._id && (
                                        <CustomerBookingMessages scheduleId={j._id} t={t} />
                                    )}

                                    <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 10 }}>
                                        <b>{t("customer.reportBooking")}</b>
                                        <select
                                            value={reportData[j._id]?.reason || ""}
                                            onChange={(e) =>
                                                setReportData((prev) => ({
                                                    ...prev,
                                                    [j._id]: { ...prev[j._id], reason: e.target.value },
                                                }))
                                            }
                                            style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 8 }}
                                        >
                                            <option value="">{t("customer.chooseReason")}</option>
                                            <option value="Worker did not arrive">{t("reports.workerNoShow")}</option>
                                            <option value="Wrong final price">{t("reports.wrongFinalPrice")}</option>
                                            <option value="Bad behavior">{t("reports.badBehavior")}</option>
                                            <option value="Poor service">{t("reports.poorService")}</option>
                                        </select>
                                        <input
                                            value={reportData[j._id]?.details || ""}
                                            placeholder={t("customer.moreDetails")}
                                            onChange={(e) =>
                                                setReportData((prev) => ({
                                                    ...prev,
                                                    [j._id]: { ...prev[j._id], details: e.target.value },
                                                }))
                                            }
                                            style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => submitReport(j._id)}
                                            style={{ marginTop: 8, background: "#111", color: "#FFD000", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: "bold" }}
                                        >
                                            {t("customer.sendReport")}
                                        </button>
                                    </div>
                                </div>
                            ))
                    )}
            </div>


            <div style={{
                marginTop: 18,
                background: "#fff",
                padding: 16,
                borderRadius: 14,
            }}>
                <h3>{t("customer.previousServices")}</h3>

                {jobs.filter(j => j.status === "completed").length === 0 ? (
                    <p>{t("customer.noCompletedServices")}</p>
                ) : (
                    jobs
                        .filter(j => j.status === "completed")
                        .map(j => (
                            <div key={j._id} style={{
                                border: "1px solid #eee",
                                padding: 14,
                                borderRadius: 12,
                                marginBottom: 12,
                                transition: "0.2s",
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.08)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.boxShadow = "none";
                                }}>
                                <b>{formatServiceName(language, j.service)}</b>
                                <div>{t("customer.worker")}: {j.worker?.name || t("common.notAvailable")}</div>
                                <div>{t("customer.workerPhone")}: {j.worker?.phone || t("common.notAvailable")}</div>
                                <div>📅 {new Date(j.date).toLocaleDateString(dashboardLocale(language))}</div>
                                {renderPricing(j)}
                                {renderTimeline(j)}

                                <div style={{ color: "blue", fontWeight: "bold" }}>
                                    {t("customer.completed")} ✅
                                </div>


                                {j.rating ? (
                                    <div style={{ marginTop: 6 }}>
                                        ⭐ {j.rating} / 5
                                        {j.review && <div>💬 {j.review}</div>}
                                    </div>
                                ) : (

                                    <div style={{ marginTop: 10 }}>
                                        <StarRating
                                            value={ratingData[j._id]?.rating || 0}
                                            onChange={(val) => handleRatingChange(j._id, "rating", val)}
                                        />

                                        <input
                                            placeholder={t("customer.writeReview")}
                                            onChange={(e) =>
                                                handleRatingChange(j._id, "review", e.target.value)
                                            }
                                        />

                                        <button
                                            onClick={() => submitRating(j._id)}
                                            style={{
                                                background: "linear-gradient(135deg, #FFD000, #ffb800)",
                                                border: "none",
                                                padding: "10px",
                                                borderRadius: 10,
                                                fontWeight: "bold",
                                                cursor: "pointer",
                                                transition: "0.2s",
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.transform = "translateY(-2px)";
                                                e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)";
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.transform = "translateY(0)";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        >
                                            {t("customer.submit")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>


            <button
                onClick={() => navigate(-1)}
                style={{
                    marginTop: 20,
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    border: "2px solid #ddd",
                    background: "transparent",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "0.2s",
                }}
                onMouseOver={(e) => {
                    e.target.style.background = "#000";
                    e.target.style.color = "#FFD000";
                    e.target.style.borderColor = "#000";
                }}
                onMouseOut={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#000";
                    e.target.style.borderColor = "#ddd";
                }}
            >
                ← {t("common.back")}
            </button>
            </div>
        </div>
    );
}

function CustomerBookingMessages({ scheduleId, t }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("user_id");

    async function fetchMessages() {
        try {
            setLoading(true);
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/messages/customer/${scheduleId}`, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.loadMessagesFailed"));
                return;
            }

            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.loadMessagesError"));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMessages();
    }, [scheduleId]);

    async function sendMessage(e) {
        e.preventDefault();

        const messageText = text.trim();
        if (!messageText) return;

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/messages/customer/${scheduleId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ text: messageText }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.sendMessageFailed"));
                return;
            }

            setText("");
            toast.success(t("toasts.messageSent"));
            fetchMessages();
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.sendMessageError"));
        }
    }

    return (
        <div style={{
            marginTop: 12,
            borderTop: "1px solid #eee",
            paddingTop: 12,
        }}>
            {loading ? (
                <p>{t("customer.loadingMessages")}</p>
            ) : (
                <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                    {messages.length === 0 ? (
                        <p>{t("customer.noMessages")}</p>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message._id}
                                style={{
                                    justifySelf: message.sender?._id === userId ? "end" : "start",
                                    maxWidth: "80%",
                                    background: message.sender?._id === userId ? "#000" : "#f2f2f2",
                                    color: message.sender?._id === userId ? "#FFD000" : "#111",
                                    padding: 10,
                                    borderRadius: 8,
                                }}
                            >
                                <div>{message.text}</div>
                                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                                    {message.sender?.name || t("common.user")}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("customer.messageWorker")}
                    style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        background: "#000",
                        color: "#FFD000",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    {t("customer.send")}
                </button>
            </form>
        </div>
    );
}
