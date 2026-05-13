import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScheduleView from "./ScheduleView";
import "./worker.css";
import NotificationsPanel from "../components/NotificationsPanel";
import {
    dashboardLocale,
    formatCurrency,
    formatPaymentType,
    formatServiceName,
    translateProgress,
    translateStatus,
    useDashboardLanguage,
} from "../utils/dashboardI18n";

export default function WorkerDashboard() {
    const navigate = useNavigate();
    const { language, isArabic, setLanguage, t } = useDashboardLanguage();
    const [active, setActive] = useState("dashboard");
    const [jobs, setJobs] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [avgRating, setAvgRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    useEffect(() => {
        fetchRatings();
    }, []);

    async function fetchRatings() {
        try {
            const userId = localStorage.getItem("user_id");

            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/worker-ratings/${userId}`);
            const data = await res.json();

            setAvgRating(data.average);
            setRatingCount(data.count);

        } catch (err) {
            console.log(err);
        }
    }
    async function fetchJobs() {
        try {
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/schedule/worker", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();
            if (Array.isArray(data)) {
                setJobs(data);
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function fetchWallet() {
        try {
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/worker/wallet", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();
            if (res.ok) {
                setWallet(data);
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchJobs();
        fetchWallet();
    }, []);

    const stats = useMemo(() => {
        const completedJobs = jobs.filter(j => j.status === "completed");

        return {
            activeJobs: jobs.filter(j => j.status === "confirmed").length,
            completed: completedJobs.length,
            earnings: wallet?.balance || 0,
            rating: avgRating || 0,
            ratingCount,
        };
    }, [jobs, avgRating, ratingCount, wallet]);

    function logout() {
        localStorage.clear();
        navigate("/");
    }

    return (
        <div className={`wd ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>

            <Sidebar active={active} setActive={setActive} onLogout={logout} t={t} />

            <div className="wdContent">
                <div className="dashboardLanguageBar">
                    <button
                        type="button"
                        className="dashboardLangToggle"
                        onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                    >
                        🌐 {t("common.languageToggle")}
                    </button>
                </div>

                {active === "dashboard" && <DashboardView stats={stats} jobs={jobs} wallet={wallet} refreshJobs={fetchJobs} refreshWallet={fetchWallet} language={language} t={t} />}
                {active === "jobs" && <JobsView jobs={jobs} refreshJobs={fetchJobs} refreshWallet={fetchWallet} language={language} t={t} />}
                {active === "schedule" && <ScheduleView language={language} t={t} />}
                {active === "messages" && <MessagesView language={language} t={t} />}
                {active === "profile" && <ProfileView language={language} t={t} />}
            </div>
            <div className="mobileBottomNav">
                <button onClick={() => setActive("dashboard")} className={active === "dashboard" ? "active" : ""}>
                    📊 <span>{t("worker.nav.dashboard")}</span>
                </button>

                <button onClick={() => setActive("jobs")} className={active === "jobs" ? "active" : ""}>
                    💼 <span>{t("worker.nav.jobs")}</span>
                </button>

                <button onClick={() => setActive("schedule")} className={active === "schedule" ? "active" : ""}>
                    📅 <span>{t("worker.nav.schedule")}</span>
                </button>

                <button onClick={() => setActive("messages")} className={active === "messages" ? "active" : ""}>
                    💬 <span>{t("worker.nav.messages")}</span>
                </button>

                <button onClick={() => setActive("profile")} className={active === "profile" ? "active" : ""}>
                    👤 <span>{t("worker.nav.profile")}</span>
                </button>
                <button onClick={logout}>
                    🚪 <span>{t("worker.nav.logout")}</span>
                </button>
            </div>
        </div>
    );
}


function Sidebar({ active, setActive, onLogout, t }) {
    const items = [
        { key: "dashboard", label: t("worker.nav.dashboard") },
        { key: "jobs", label: t("worker.nav.myJobs") },
        { key: "schedule", label: t("worker.nav.schedule") },
        { key: "messages", label: t("worker.nav.messages") },
        { key: "profile", label: t("worker.nav.profile") },
    ];

    return (
        <div className="wdSidebar">
            <div className="wdLogo">TAZABEET</div>

            <div className="wdMenu">
                {items.map((it) => (
                    <button
                        key={it.key}
                        onClick={() => setActive(it.key)}
                        className={`wdMenuItem ${active === it.key ? "active" : ""}`}
                    >
                        {it.label}
                    </button>
                ))}
            </div>

            <button className="wdLogout" onClick={onLogout}>
                {t("worker.nav.logout")}
            </button>
        </div>
    );
}


function DashboardView({ stats, jobs, wallet, refreshJobs, refreshWallet, language, t }) {
    return (
        <div>
            <h1>{t("worker.nav.dashboard")}</h1>

            <div className="wdCards">
                <Card title={t("worker.activeJobs")} value={stats.activeJobs} />
                <Card title={t("worker.completed")} value={stats.completed} />
                <Card title={t("worker.walletBalance")} value={`${stats.earnings} ${t("common.egp")}`} />
                <Card title={t("worker.cashDebt")} value={`${wallet?.cashDebt || 0} ${t("common.egp")}`} />
                <Card title={t("worker.rating")} value={`⭐ ${stats.rating} (${stats.ratingCount})`} />
            </div>

            <WalletPanel wallet={wallet} refreshWallet={refreshWallet} language={language} t={t} />

            <Panel title={t("worker.recentJobs")}>
                <JobsTable jobs={jobs.slice(0, 5)} refreshJobs={refreshJobs} refreshWallet={refreshWallet} language={language} t={t} />
            </Panel>
        </div>
    );
}

function WalletPanel({ wallet, refreshWallet, language, t }) {
    const transactions = wallet?.transactions || [];

    return (
        <Panel title={t("worker.wallet")}>
            <div className={`walletStatus ${wallet?.canAcceptCashOrders === false ? "blocked" : "ok"}`}>
                <b>
                    {wallet?.canAcceptCashOrders === false
                        ? t("worker.cashOrdersBlocked")
                        : t("worker.cashOrdersAvailable")}
                </b>
                <span>
                    {t("worker.remainingBeforeBlock")}: {wallet?.remainingBeforeBlock ?? 0} {formatCurrency(language, wallet?.currency)}
                </span>
            </div>

            <div className="walletGrid">
                <div>
                    <span>{t("worker.cashCollected")}</span>
                    <b>{wallet?.cashCollected || 0} {formatCurrency(language, wallet?.currency)}</b>
                </div>
                <div>
                    <span>{t("worker.platformFees")}</span>
                    <b>{wallet?.platformFees || 0} {formatCurrency(language, wallet?.currency)}</b>
                </div>
                <div>
                    <span>{t("worker.cashDebt")}</span>
                    <b>{wallet?.cashDebt || 0} {formatCurrency(language, wallet?.currency)}</b>
                </div>
                <div>
                    <span>{t("worker.debtLimit")}</span>
                    <b>{wallet?.debtLimit || 0} {formatCurrency(language, wallet?.currency)}</b>
                </div>
            </div>

            <div className="paymentSetup">
                <b>{t("worker.paymentSetup")}</b>
                <span>{t("common.cash")}: {t("worker.cashActive")}</span>
                <span>InstaPay: {t("worker.manualSetupRequired")}</span>
                <span>Vodafone Cash: {t("worker.merchantRequired")}</span>
                <span>Fawry: {t("worker.merchantRequired")}</span>
            </div>

            <div className="walletTransactionsHeader">
                <b>{t("worker.walletTransactions")}</b>
                {refreshWallet && (
                    <button type="button" onClick={refreshWallet}>
                        ↻
                    </button>
                )}
            </div>

            {transactions.length === 0 ? (
                <p>{t("worker.noWalletTransactions")}</p>
            ) : (
                <div className="walletTransactions">
                    {transactions.map((tx) => (
                        <div key={tx._id} className="walletTransaction">
                            <div>
                                <b>{t(`worker.transactionTypes.${tx.type}`)}</b>
                                <span>{tx.schedule?.service || tx.description}</span>
                            </div>
                            <strong className={tx.direction === "debit" ? "debit" : "credit"}>
                                {tx.direction === "debit" ? "-" : "+"}{tx.amount} {formatCurrency(language, tx.currency)}
                            </strong>
                            <small>{new Date(tx.createdAt).toLocaleString(dashboardLocale(language))}</small>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
}


function JobsView({ jobs, refreshJobs, refreshWallet, language, t }) {
    const [filter, setFilter] = useState("all");
    const filters = ["all", "pending", "confirmed", "completed", "rejected", "cancelled"];

    const filteredJobs =
        filter === "all"
            ? jobs
            : jobs.filter(j => j.status === filter);
    return (
        <div>
            <h1>{t("worker.nav.myJobs")}</h1>

            <div style={{ marginBottom: 10 }}>
                <div className="filterBar">
                    {filters.map((filterKey) => (
                        <button
                            key={filterKey}
                            className={`filterBtn ${filter === filterKey ? "active" : ""}`}
                            onClick={() => setFilter(filterKey)}
                        >
                            {t(`worker.filters.${filterKey}`)}
                        </button>
                    ))}
                </div>
            </div>

            <Panel title={t("worker.allJobs")}>
                <JobsTable jobs={filteredJobs} refreshJobs={refreshJobs} refreshWallet={refreshWallet} language={language} t={t} />
            </Panel>
        </div>
    );
}



function JobsTable({ jobs, refreshJobs, refreshWallet, language, t }) {
    const [quoteData, setQuoteData] = useState({});

    if (!jobs.length) return <p>{t("worker.noJobs")}</p>;

    function getJobAddress(job) {
        return (
            job.address ||
            job.customerAddress ||
            job.bookingAddress ||
            job.customer?.address ||
            ""
        );
    }

    function getJobLocation(job) {
        return job.location || job.customerLocation || job.bookingLocation;
    }

    function formatEstimate(job) {
        if (!job.estimatedPrice?.min || !job.estimatedPrice?.max) return t("worker.notEstimated");
        return `${job.estimatedPrice.min} - ${job.estimatedPrice.max} ${formatCurrency(language, job.estimatedPrice.currency)}`;
    }

    function formatFinalPrice(job) {
        if (!job.finalPrice?.amount) return t("worker.noFinalPrice");
        return `${job.finalPrice.amount} ${formatCurrency(language, job.finalPrice.currency)} (${translateStatus(language, job.finalPrice.status || "pending")})`;
    }


    async function completeJob(id) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/complete/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("common.failed"));
                return;
            }

            toast.success(t("toasts.jobCompleted"));
            refreshJobs();
            if (refreshWallet) refreshWallet();

        } catch (err) {
            console.log(err);
            toast.error(t("toasts.completeError"));
        }
    }


    async function acceptJob(id) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/accept/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("common.failed"));
                return;
            }

            toast.success(t("toasts.jobAccepted"));
            refreshJobs();

        } catch (err) {
            console.log(err);
            toast.error(t("toasts.acceptError"));
        }
    }

    async function sendFinalPrice(id) {
        const current = quoteData[id] || {};

        if (!current.amount) {
            toast.error(t("toasts.enterFinalPrice"));
            return;
        }

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/final-price/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    amount: current.amount,
                    note: current.note || "",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.finalPriceFailed"));
                return;
            }

            toast.success(t("toasts.finalPriceSent"));
            setQuoteData((prev) => ({ ...prev, [id]: { amount: "", note: "" } }));
            refreshJobs();
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.finalPriceError"));
        }
    }

    async function updateProgress(id, progressStatus) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/progress/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ progressStatus }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.progressFailed"));
                return;
            }

            toast.success(t("toasts.progressUpdated"));
            refreshJobs();
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.progressError"));
        }
    }


    async function rejectJob(id) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/reject/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("common.failed"));
                return;
            }

            toast.success(t("toasts.jobRejected"));
            refreshJobs();

        } catch (err) {
            console.log(err);
            toast.error(t("toasts.rejectError"));
        }
    }


    async function cancelJob(id) {
        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/cancel/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("common.failed"));
                return;
            }

            toast.success(t("toasts.jobCancelled"));
            refreshJobs();

        } catch (err) {
            console.log(err);
            toast.error(t("toasts.cancelError"));
        }
    }

    return (
        <div className="tableWrapper">
            <table className="wdTable">
                <thead>
                    <tr>
                        <th>{t("worker.table.customer")}</th>
                        <th>{t("worker.table.phone")}</th>
                        <th>{t("worker.table.address")}</th>
                        <th>{t("worker.table.issue")}</th>
                        <th>{t("worker.table.payment")}</th>
                        <th>{t("worker.table.price")}</th>
                        <th>{t("worker.table.date")}</th>
                        <th>{t("worker.table.time")}</th>
                        <th>{t("worker.table.status")}</th>
                        <th>{t("worker.table.actions")}</th>
                    </tr>
                </thead>

                <tbody>
                    {jobs.map((j) => {
                        const jobAddress = getJobAddress(j);
                        const jobLocation = getJobLocation(j);

                        return (
                            <tr key={j._id}>
                                <td data-label={t("worker.table.customer")}>{j.customer?.name || t("common.notAvailable")}</td>
                                <td data-label={t("worker.table.phone")}>{j.customer?.phone || t("common.notAvailable")}</td>
                                <td data-label={t("worker.table.address")}>
                                    {jobAddress || `❌ ${t("worker.noAddress")}`}

                                    {jobLocation?.lat && jobLocation?.lng && (
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            📍 {Number(jobLocation.lat).toFixed(4)}, {Number(jobLocation.lng).toFixed(4)}
                                        </div>
                                    )}
                                </td>
                                <td data-label={t("worker.table.issue")}>
                                    {j.description ? (
                                        <div className="jobIssueText">
                                            {j.description}
                                        </div>
                                    ) : (
                                        <span className="jobIssueEmpty">{t("common.notAvailable")}</span>
                                    )}

                                    {j.bookingMedia?.length > 0 ? (
                                        <div className="jobMediaGrid">
                                            {j.bookingMedia.map((file, index) => {
                                                const mediaUrl = typeof file === "string" ? file : file.url;
                                                const mediaType = typeof file === "string" ? "" : file.type;
                                                const mediaName = typeof file === "string" ? "" : file.name;
                                                const isVideo = mediaType === "video" || mediaType?.startsWith("video");

                                                return (
                                                    <a
                                                        key={`${mediaName || mediaUrl}-${index}`}
                                                        className="jobMediaPreview"
                                                        href={mediaUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title={mediaName || `${isVideo ? t("common.video") : t("common.photo")} ${index + 1}`}
                                                    >
                                                        {isVideo ? (
                                                            <video src={mediaUrl} muted playsInline />
                                                        ) : (
                                                            <img src={mediaUrl} alt={mediaName || `${t("common.photo")} ${index + 1}`} />
                                                        )}
                                                        <span>{isVideo ? t("common.video") : t("common.photo")} {index + 1}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="jobMediaEmpty">{t("servicesPage.no")} {t("servicesPage.files")}</div>
                                    )}
                                </td>
                                <td data-label={t("worker.table.payment")}>{formatPaymentType(language, j.paymentType)}</td>
                                <td data-label={t("worker.table.price")}>
                                    <div>{formatEstimate(j)}</div>
                                    <small>{formatFinalPrice(j)}</small>
                                </td>
                                <td data-label={t("worker.table.date")}>{new Date(j.date).toLocaleDateString(dashboardLocale(language))}</td>
                                <td data-label={t("worker.table.time")}>{j.startTime}</td>

                                <td data-label={t("worker.table.status")}>
                                    <span className={`status ${j.status}`}>
                                        {translateStatus(language, j.status)}
                                    </span>
                                    <div className="jobProgressMini">
                                        {translateProgress(language, j.progressStatus)}
                                    </div>
                                </td>

                                <td data-label={t("worker.table.actions")}>


                                    {j.status === "available" && (
                                        <span style={{ color: "#777", fontWeight: "bold" }}>
                                            {t("worker.openSlot")}
                                        </span>
                                    )}

                                    {j.status === "pending" && (
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="acceptBtn" onClick={() => acceptJob(j._id)}>
                                                {t("worker.accept")}
                                            </button>

                                            <button className="rejectBtn" onClick={() => rejectJob(j._id)}>
                                                {t("worker.reject")}
                                            </button>
                                        </div>
                                    )}


                                    {(j.status === "confirmed" || j.status === "accepted") && (
                                        <div style={{ display: "grid", gap: 6 }}>
                                            {j.finalPrice?.status !== "accepted" && (
                                                <div className="quoteBox">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder={t("worker.finalPrice")}
                                                        value={quoteData[j._id]?.amount || ""}
                                                        onChange={(e) =>
                                                            setQuoteData((prev) => ({
                                                                ...prev,
                                                                [j._id]: {
                                                                    ...prev[j._id],
                                                                    amount: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                    <input
                                                        placeholder={t("worker.note")}
                                                        value={quoteData[j._id]?.note || ""}
                                                        onChange={(e) =>
                                                            setQuoteData((prev) => ({
                                                                ...prev,
                                                                [j._id]: {
                                                                    ...prev[j._id],
                                                                    note: e.target.value,
                                                                },
                                                            }))
                                                        }
                                                    />
                                                    <button className="acceptBtn" onClick={() => sendFinalPrice(j._id)}>
                                                        {t("worker.sendPrice")}
                                                    </button>
                                                </div>
                                            )}

                                            {j.finalPrice?.status === "accepted" && (
                                                <div className="progressActions">
                                                    <button type="button" onClick={() => updateProgress(j._id, "on_the_way")}>
                                                        {t("worker.onMyWay")}
                                                    </button>
                                                    <button type="button" onClick={() => updateProgress(j._id, "arrived")}>
                                                        {t("worker.arrived")}
                                                    </button>
                                                    <button type="button" onClick={() => updateProgress(j._id, "work_started")}>
                                                        {t("worker.started")}
                                                    </button>
                                                </div>
                                            )}

                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    className="completeBtn"
                                                    onClick={() => completeJob(j._id)}
                                                >
                                                    {t("worker.complete")}
                                                </button>

                                                <button
                                                    className="cancelBtn"
                                                    onClick={() => cancelJob(j._id)}
                                                >
                                                    {t("common.cancel")}
                                                </button>
                                            </div>
                                        </div>
                                    )}


                                    {j.status === "completed" && (
                                        <span style={{ color: "green", fontWeight: "bold" }}>
                                            {t("worker.done")}
                                        </span>
                                    )}


                                    {j.status === "rejected" && (
                                        <span style={{ color: "red" }}>
                                            {translateStatus(language, "rejected")}
                                        </span>
                                    )}


                                    {j.status === "cancelled" && (
                                        <span style={{ color: "orange" }}>
                                            {translateStatus(language, "cancelled")}
                                        </span>
                                    )}

                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}


function Card({ title, value }) {
    return (
        <div className="wdCard">
            <div>{title}</div>
            <h2>{value}</h2>
        </div>
    );
}

function Panel({ title, children }) {
    return (
        <div className="wdPanel">
            <h3>{title}</h3>
            {children}
        </div>
    );
}

function MessagesView({ language, t }) {
    const [messages, setMessages] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState("");
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(true);

    async function fetchMessages() {
        try {
            setLoading(true);
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/messages/worker", {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.loadMessagesFailed"));
                return;
            }

            const nextMessages = Array.isArray(data) ? data : [];
            setMessages(nextMessages);

            if (!selectedScheduleId && nextMessages.length) {
                setSelectedScheduleId(nextMessages[0].schedule?._id);
            }
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.loadMessagesError"));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMessages();
    }, []);

    async function sendReply(e) {
        e.preventDefault();

        const text = reply.trim();
        if (!selectedScheduleId || !text) return;

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/messages/worker/${selectedScheduleId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.replyFailed"));
                return;
            }

            setReply("");
            toast.success(t("toasts.replySent"));
            fetchMessages();
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.replyError"));
        }
    }

    const threads = Object.values(
        messages.reduce((acc, message) => {
            const scheduleId = message.schedule?._id;
            if (!scheduleId) return acc;

            if (!acc[scheduleId]) {
                acc[scheduleId] = {
                    schedule: message.schedule,
                    customer: message.customer,
                    messages: [],
                };
            }

            acc[scheduleId].messages.push(message);
            return acc;
        }, {})
    );

    const selectedThread = threads.find((thread) => thread.schedule?._id === selectedScheduleId);

    if (loading) return <p>{t("worker.loadingMessages")}</p>;

    return (
        <div>
            <h1>{t("worker.nav.messages")}</h1>

            {threads.length === 0 ? (
                <Panel title={t("worker.conversations")}>
                    <p>{t("worker.noMessages")}</p>
                </Panel>
            ) : (
                <div className="messagesLayout">
                    <Panel title={t("worker.conversations")}>
                        <div className="threadList">
                            {threads.map((thread) => {
                                const lastMessage = thread.messages[thread.messages.length - 1];
                                const scheduleId = thread.schedule?._id;

                                return (
                                    <button
                                        key={scheduleId}
                                        type="button"
                                        onClick={() => setSelectedScheduleId(scheduleId)}
                                        className={`threadButton ${selectedScheduleId === scheduleId ? "active" : ""}`}
                                    >
                                        <b>{thread.customer?.name || t("common.customer")}</b>
                                        <div style={{ fontSize: 12 }}>{thread.customer?.phone || t("common.noPhone")}</div>
                                        <div style={{ fontSize: 12, color: "#666" }}>
                                            {formatServiceName(language, thread.schedule?.service)} - {lastMessage?.text}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </Panel>

                    <Panel title={selectedThread?.customer?.name || t("worker.conversation")}>
                        {selectedThread && (
                            <>
                                <div style={{ marginBottom: 10, fontSize: 13 }}>
                                    {t("common.phone")}: <b>{selectedThread.customer?.phone || t("common.notAvailable")}</b>
                                </div>

                                <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                                    {selectedThread.messages.map((message) => (
                                        <div
                                            key={message._id}
                                            style={{
                                                justifySelf: message.sender?._id === localStorage.getItem("user_id") ? "end" : "start",
                                                maxWidth: "75%",
                                                background: message.sender?._id === localStorage.getItem("user_id") ? "#000" : "#f2f2f2",
                                                color: message.sender?._id === localStorage.getItem("user_id") ? "#FFD000" : "#111",
                                                padding: 10,
                                                borderRadius: 8,
                                            }}
                                        >
                                            <div>{message.text}</div>
                                            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                                                {message.sender?.name || t("common.user")}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={sendReply} className="messageReplyForm">
                                    <input
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder={t("worker.writeReply")}
                                    />
                                    <button className="acceptBtn" type="submit">{t("worker.send")}</button>
                                </form>
                            </>
                        )}
                    </Panel>
                </div>
            )}
        </div>
    );
}


function ProfileView({ language, t }) {
    const [experience, setExperience] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");

    const [items, setItems] = useState([]);

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [files, setFiles] = useState([]);
    const [verificationStatus, setVerificationStatus] = useState("not_submitted");
    const [verificationDocs, setVerificationDocs] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const userId = localStorage.getItem("user_id");
                const res = await fetch(`https://tazabeet-backend.vibenest.net/api/auth/worker/${userId}`);
                const data = await res.json();

                if (!res.ok) return;

                setExperience(data.worker?.experience || "");
                setProfilePhoto(data.worker?.profilePhoto || "");
                setItems(data.worker?.portfolio || []);
                setVerificationStatus(data.worker?.verificationStatus || "not_submitted");
                setVerificationDocs(data.worker?.verificationDocs || []);
            } catch (err) {
                console.log(err);
            }
        }

        loadProfile();
    }, []);

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function saveWorkerProfile(next = {}) {
        const nextExperience = next.experience ?? experience;
        const nextProfilePhoto = next.profilePhoto ?? profilePhoto;
        const nextItems = next.items ?? items;
        const nextVerificationDocs = next.verificationDocs ?? verificationDocs;

        try {
            setSaving(true);
            const res = await fetch("https://tazabeet-backend.vibenest.net/api/auth/worker-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    experience: nextExperience,
                    profilePhoto: nextProfilePhoto,
                    portfolio: nextItems,
                    verificationDocs: nextVerificationDocs,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || t("toasts.profileSaveFailed"));
                return;
            }

            toast.success(t("toasts.profileSaved"));
            if (data.worker?.verificationStatus) setVerificationStatus(data.worker.verificationStatus);
        } catch (err) {
            console.log(err);
            toast.error(t("toasts.profileSaveError"));
        } finally {
            setSaving(false);
        }
    }

    function saveExperience(val) {
        setExperience(val);
    }

    async function handlePhotoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image")) {
            toast.error(t("toasts.profilePhotoImage"));
            return;
        }

        const photo = await readFileAsDataUrl(file);
        setProfilePhoto(photo);
        saveWorkerProfile({ profilePhoto: photo });
    }

    function handleFileChange(e) {
        const selected = Array.from(e.target.files);

        const filtered = selected.filter(f =>
            f.type.startsWith("image") || f.type.startsWith("video")
        );

        setFiles(filtered);
    }

    async function handleVerificationDocs(e) {
        const selected = Array.from(e.target.files || []).filter((file) =>
            file.type.startsWith("image") || file.type === "application/pdf"
        );
        const docs = await Promise.all(selected.slice(0, 4).map(async (file) => ({
            name: file.name,
            type: file.type,
            url: await readFileAsDataUrl(file),
        })));

        setVerificationDocs(docs);
        saveWorkerProfile({ verificationDocs: docs });
    }

    async function addPortfolio(e) {
        e.preventDefault();

        if (!title.trim()) {
            toast.error(t("toasts.titleRequired"));
            return;
        }

        const media = await Promise.all(files.map(async (file) => ({
            name: file.name,
            type: file.type,
            url: await readFileAsDataUrl(file),
        })));

        const newItem = {
            id: Date.now(),
            title,
            desc,
            media,
            createdAt: new Date().toISOString(),
        };

        const updated = [newItem, ...items];

        setItems(updated);
        saveWorkerProfile({ items: updated });

        setTitle("");
        setDesc("");
        setFiles([]);
    }

    function removeItem(id) {
        const updated = items.filter((item) => (item.id || item._id) !== id);
        setItems(updated);
        saveWorkerProfile({ items: updated });
    }

    return (
        <div>
            <h1>{t("worker.nav.profile")}</h1>

            <NotificationsPanel language={language} t={t} />

            <Panel title={t("worker.workerVerification")}>
                <div className={`verifiedBadge ${verificationStatus === "verified" ? "ok" : ""}`}>
                    {t("worker.status")}: {translateStatus(language, verificationStatus)}
                </div>
                <p>{t("worker.verificationHelp")}</p>
                <input type="file" multiple accept="image/*,application/pdf" onChange={handleVerificationDocs} />
                {verificationDocs.length > 0 && (
                    <div className="jobMediaList">
                        {verificationDocs.map((doc, index) => (
                            <a key={`${doc.name}-${index}`} href={doc.url} target="_blank" rel="noreferrer">
                                {doc.name || `${t("common.document")} ${index + 1}`}
                            </a>
                        ))}
                    </div>
                )}
            </Panel>

            <Panel title={t("worker.profilePhoto")}>
                <div className="workerPhotoEditor">
                    <div className="workerProfilePhoto">
                        {profilePhoto ? (
                            <img src={profilePhoto} alt={t("worker.workerProfileAlt")} />
                        ) : (
                            <span>{localStorage.getItem("customer_name")?.charAt(0) || "W"}</span>
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </div>
            </Panel>

            <Panel title={t("worker.experience")}>
                <textarea
                    value={experience}
                    onChange={(e) => saveExperience(e.target.value)}
                    placeholder={t("worker.writeExperience")}
                />
                <button type="button" onClick={() => saveWorkerProfile()} disabled={saving}>
                    {saving ? t("common.saving") : t("worker.saveExperience")}
                </button>
            </Panel>

            <Panel title={t("worker.addPortfolio")}>
                <form onSubmit={addPortfolio}>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("worker.title")} />
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("worker.description")} />
                    <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} />

                    {files.length > 0 && (
                        <div className="previewGrid">
                            {files.map((file, i) =>
                                file.type.startsWith("video") ? (
                                    <video key={i} src={URL.createObjectURL(file)} controls />
                                ) : (
                                    <img key={i} src={URL.createObjectURL(file)} alt="" />
                                )
                            )}
                        </div>
                    )}

                    <button type="submit">{t("worker.addToPortfolio")}</button>
                </form>
            </Panel>

            <Panel title={t("worker.myPortfolio")}>
                {items.length === 0 ? (
                    <p>{t("worker.noPortfolio")}</p>
                ) : (
                    <div className="portfolioGrid">
                        {items.map((item) => (
                            <div key={item.id || item._id} className="portfolioCard">
                                <h4>{item.title}</h4>
                                {item.desc && <p>{item.desc}</p>}

                                <div className="portfolioMedia">
                                    {item.media.map((m, i) => {
                                        const mediaUrl = typeof m === "string" ? m : m.url;
                                        const mediaType = typeof m === "string" ? "" : m.type;

                                        return mediaType.startsWith("video") ? (
                                            <video key={i} src={mediaUrl} controls />
                                        ) : (
                                            <img key={i} src={mediaUrl} alt="" />
                                        );
                                    })}
                                </div>

                                <button className="deleteBtn" onClick={() => removeItem(item.id || item._id)}>
                                    {t("common.delete")}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </div>
    );
}
