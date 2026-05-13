import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./ai.css";
import { formatServiceName, useDashboardLanguage } from "../utils/dashboardI18n";

function createInitialMessages(t) {
    return [{
        id: 1,
        sender: "bot",
        text: t("aiPage.initial"),
    }];
}

const quickReplies = [
    "Water leak under the sink",
    "Electric socket smells burned",
    "AC not cooling",
    "عايز سباك",
    "مشكلة كهرباء",
    "التكييف مش شغال",
];

function detectArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function loadVideo(url) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.onloadedmetadata = () => resolve(video);
        video.onerror = reject;
        video.src = url;
    });
}

function seekVideo(video, time) {
    return new Promise((resolve) => {
        video.onseeked = resolve;
        video.currentTime = Math.min(Math.max(time, 0), video.duration || 0);
    });
}

function captureVideoFrame(video) {
    const canvas = document.createElement("canvas");
    const width = Math.min(video.videoWidth || 640, 900);
    const ratio = width / (video.videoWidth || width);

    canvas.width = width;
    canvas.height = Math.max(1, Math.round((video.videoHeight || 360) * ratio));

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.78);
}

async function buildFilePayload(file, t) {
    if (!file) return null;

    if (file.type.startsWith("image/")) {
        return {
            type: "image",
            name: file.name,
            dataUrl: await readFileAsDataUrl(file),
        };
    }

    if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);

        try {
            const video = await loadVideo(url);
            const duration = video.duration || 1;
            const sampleTimes = [0.2, duration * 0.5, duration * 0.85].filter(
                (time, index, arr) => Number.isFinite(time) && arr.indexOf(time) === index
            );
            const frames = [];

            for (const time of sampleTimes) {
                await seekVideo(video, time);
                frames.push(captureVideoFrame(video));
            }

            return {
                type: "video",
                name: file.name,
                frames,
            };
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    throw new Error(t("aiPage.uploadError"));
}

export default function AIChatSection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, isArabic, setLanguage, t } = useDashboardLanguage();

    const [messages, setMessages] = useState(() => createInitialMessages(t));
    const [input, setInput] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [thinking, setThinking] = useState(false);
    const messagesEndRef = useRef(null);
    const [showNav, setShowNav] = useState(true);

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinking]);

    useEffect(() => {
        setMessages((prev) => (
            prev.length === 1 && prev[0].id === 1 ? createInitialMessages(t) : prev
        ));
    }, [language, t]);

    async function sendToAi(text, file) {
        if (thinking) return;
        if (!text.trim() && !file) return;

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { state: { tab: "login", needLogin: true } });
            return;
        }

        const userText = text.trim() || `${t("aiPage.uploadedFile")}: ${file.name}`;
        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: file ? `${userText}\nAttached: ${file.name}` : userText,
        };

        setMessages((prev) => [...prev, userMessage]);
        setThinking(true);

        try {
            const payloadFile = await buildFilePayload(file, t);

            const res = await fetch("https://tazabeet-backend.vibenest.net/api/ai/diagnose", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: text.trim(),
                    file: payloadFile,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || t("aiPage.diagnosisFailed"));

            const botMessage = {
                id: Date.now() + 1,
                sender: "bot",
                text: data.reply,
                service: data.service,
                urgency: data.urgency,
            };

            setMessages((prev) => [...prev, botMessage]);
            setInput("");
            setSelectedFile(null);
        } catch (err) {
            toast.error(err.message || t("aiPage.diagnosisFailed"));
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: "bot",
                    text: t("aiPage.unavailable"),
                },
            ]);
        } finally {
            setThinking(false);
        }
    }

    function handleSend() {
        sendToAi(input, selectedFile);
    }

    function handleQuickReply(reply) {
        sendToAi(reply, null);
    }

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            toast.error(t("aiPage.uploadError"));
            return;
        }

        setSelectedFile(file);
        e.target.value = "";
    }

    return (
        <div className={`aiWrapper ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
            <div className="lpDesktopNav">
                <button type="button" onClick={() => navigate("/")}>{t("site.home")}</button>

                <button
                    type="button"
                    onClick={() => {
                        const token = localStorage.getItem("token");
                        const role = localStorage.getItem("role");
                        if (token && role === "customer") navigate("/services");
                        else navigate("/login", { state: { tab: "login", needLogin: true } });
                    }}
                >
                    {t("site.services")}
                </button>

                <button type="button" onClick={() => navigate("/ai-chat")}>{t("site.aiChat")}</button>
                <button type="button" onClick={() => navigate("/contact")}>{t("site.contact")}</button>
                <button
                    type="button"
                    className="dashboardLangToggle"
                    onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                >
                    🌐 {t("common.languageToggle")}
                </button>
            </div>

            <div className="aiHeader">
                <div>
                    <h2>{t("aiPage.title")}</h2>
                    <p>{t("aiPage.subtitle")}</p>
                </div>
                <div className="aiHeaderActions">
                    <div className="aiBadge">{t("aiPage.badge")}</div>
                    <button
                        type="button"
                        className="aiLangToggle"
                        onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                    >
                        🌐 {t("common.languageToggle")}
                    </button>
                </div>
            </div>

            <div className="aiChatBox">
                <div className="aiMessages">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`aiRow ${msg.sender === "user" ? "right" : "left"}`}
                        >
                            <div className={`aiBubble ${msg.sender}`}>
                                <div>{msg.text}</div>

                                {msg.urgency && (
                                    <span className={`aiUrgency ${msg.urgency}`}>
                                        {msg.urgency}
                                    </span>
                                )}

                                {msg.service && (
                                    <button
                                        className="aiBookBtn"
                                        onClick={() =>
                                            navigate("/services", {
                                                state: { service: msg.service },
                                            })
                                        }
                                    >
                                        {detectArabic(msg.text)
                                            ? t("aiPage.book", { service: formatServiceName("ar", msg.service) })
                                            : t("aiPage.book", { service: formatServiceName(language, msg.service) })}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {thinking && (
                        <div className="aiRow left">
                            <div className="aiBubble bot aiThinking">{t("aiPage.analyzing")}</div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="aiQuickReplies">
                    {quickReplies.map((reply, i) => (
                        <button key={i} onClick={() => handleQuickReply(reply)} disabled={thinking}>
                            {reply}
                        </button>
                    ))}
                </div>

                {selectedFile && (
                    <div className="aiFile">
                        {t("aiPage.selected")}: {selectedFile.name}
                        {selectedFile.type.startsWith("video/") && (
                            <span> {t("aiPage.videoNote")}</span>
                        )}
                    </div>
                )}

                <div className="aiInputArea">
                    <label className="aiUpload">
                        {t("aiPage.upload")}
                        <input type="file" accept="image/*,video/*" onChange={handleFileChange} hidden />
                    </label>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t("aiPage.placeholder")}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSend();
                        }}
                        disabled={thinking}
                    />

                    <button onClick={handleSend} disabled={thinking}>
                        {thinking ? t("aiPage.wait") : t("aiPage.send")}
                    </button>
                </div>
            </div>

            <div className="aiNote">
                {t("aiPage.note")}
            </div>

            <div className={`mobileNav ${showNav ? "show" : "hide"}`}>
                <button
                    className={location.pathname === "/" ? "active" : ""}
                    onClick={() => navigate("/")}>
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

                <button
                    className={location.pathname === "/contact" ? "active" : ""}
                    onClick={() => navigate("/contact")}>
                    <span>📞</span>
                    <p>{t("site.contact")}</p>
                </button>
            </div>
        </div>
    );
}
