import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./ai.css";

const initialMessages = [
    {
        id: 1,
        sender: "bot",
        text: "Hello! Tell me what issue you're facing, or upload a photo/video and I’ll guide you with quick safe steps.",
    },
];

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

async function buildFilePayload(file) {
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

    throw new Error("Please upload an image or video file.");
}

export default function AIChatSection() {
    const navigate = useNavigate();
    const location = useLocation();

    const [messages, setMessages] = useState(initialMessages);
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

    async function sendToAi(text, file) {
        if (thinking) return;
        if (!text.trim() && !file) return;

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { state: { tab: "login", needLogin: true } });
            return;
        }

        const userText = text.trim() || `Uploaded file: ${file.name}`;
        const userMessage = {
            id: Date.now(),
            sender: "user",
            text: file ? `${userText}\nAttached: ${file.name}` : userText,
        };

        setMessages((prev) => [...prev, userMessage]);
        setThinking(true);

        try {
            const payloadFile = await buildFilePayload(file);

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
            if (!res.ok) throw new Error(data.message || "AI diagnosis failed.");

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
            toast.error(err.message || "AI diagnosis failed.");
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: "bot",
                    text: "I could not analyze that right now. Make sure Ollama is running, then try again.",
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
            toast.error("Please upload an image or video file.");
            return;
        }

        setSelectedFile(file);
        e.target.value = "";
    }

    return (
        <div className="aiWrapper">
            <div className="lpDesktopNav">
                <button type="button" onClick={() => navigate("/")}>Home</button>

                <button
                    type="button"
                    onClick={() => {
                        const token = localStorage.getItem("token");
                        const role = localStorage.getItem("role");
                        if (token && role === "customer") navigate("/services");
                        else navigate("/login", { state: { tab: "login", needLogin: true } });
                    }}
                >
                    Services
                </button>

                <button type="button" onClick={() => navigate("/ai-chat")}>AI Chat</button>
                <button type="button" onClick={() => navigate("/contact")}>Contact</button>
            </div>

            <div className="aiHeader">
                <div>
                    <h2>AI Diagnostics</h2>
                    <p>Chat in English or العربية</p>
                </div>
                <div className="aiBadge">Local Ollama</div>
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
                                            ? `احجز ${msg.service}`
                                            : `Book ${msg.service}`}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {thinking && (
                        <div className="aiRow left">
                            <div className="aiBubble bot aiThinking">Analyzing with Ollama...</div>
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
                        Selected: {selectedFile.name}
                        {selectedFile.type.startsWith("video/") && (
                            <span> Video will be checked from sampled frames.</span>
                        )}
                    </div>
                )}

                <div className="aiInputArea">
                    <label className="aiUpload">
                        Upload
                        <input type="file" accept="image/*,video/*" onChange={handleFileChange} hidden />
                    </label>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe problem..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSend();
                        }}
                        disabled={thinking}
                    />

                    <button onClick={handleSend} disabled={thinking}>
                        {thinking ? "Wait" : "Send"}
                    </button>
                </div>
            </div>

            <div className="aiNote">
                AI gives quick safety guidance only. For danger, call emergency services and book a professional.
            </div>

            <div className={`mobileNav ${showNav ? "show" : "hide"}`}>
                <button
                    className={location.pathname === "/" ? "active" : ""}
                    onClick={() => navigate("/")}>
                    <span>🏠</span>
                    <p>Home</p>
                </button>

                <button className={location.pathname === "/services" ? "active" : ""} onClick={() => navigate("/services")}>
                    <span>🧰</span>
                    <p>Services</p>
                </button>

                <button className={location.pathname === "/ai-chat" ? "active" : ""} onClick={() => navigate("/ai-chat")}>
                    <span>💬</span>
                    <p>Chat</p>
                </button>

                <button
                    className={location.pathname === "/contact" ? "active" : ""}
                    onClick={() => navigate("/contact")}>
                    <span>📞</span>
                    <p>Contact</p>
                </button>
            </div>
        </div>
    );
}
