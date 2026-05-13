import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";
import logo from "../assets/logo.png";
import { SocialIcon } from 'react-social-icons'
export default function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const reviews = [
        { name: "Sara", text: "Great service! The plumber arrived on time and fixed my leak quickly.", rating: 5 },
        { name: "Omar", text: "The electrician was very professional and solved our power issue efficiently.", rating: 4.5 },
        { name: "Laila", text: "I booked a cleaning service, and they did an amazing job. My house has never been cleaner!", rating: 4.8 },
    ];
    const [showNav, setShowNav] = useState(true);
    const [selectedNeed, setSelectedNeed] = useState("Leaking water");
    const [gameStarted, setGameStarted] = useState(false);
    const [selectedGameCard, setSelectedGameCard] = useState(null);
    const [promoPrize, setPromoPrize] = useState(() => localStorage.getItem("promo_code") || "");

    useEffect(() => {
        let lastScroll = window.scrollY;

        const handleScroll = () => {
            const currentScroll = window.scrollY;

            if (currentScroll > lastScroll) {
                setShowNav(false);
            } else {
                setShowNav(true);
            }

            lastScroll = currentScroll;
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const isCustomerLoggedIn = !!token && role === "customer";

    const [q, setQ] = useState("");
    const needLogin = location.state?.needLogin;

    const categories = useMemo(
        () => [
            { key: "plumbing", label: "Plumbing", icon: "🔧" },
            { key: "electrical", label: "Electrical", icon: "⚡" },
            { key: "cleaning", label: "Cleaning", icon: "🧹" },
            { key: "painting", label: "Painting", icon: "🎨" },
            { key: "moving", label: "Moving", icon: "📦" },
            { key: "carpentry", label: "Carpentry", icon: "🪚" },
            { key: "ac", label: "AC Repair", icon: "❄️" },
            { key: "pest", label: "Pest Control", icon: "🐜" },
        ],
        []
    );

    const quickNeeds = [
        { label: "Leaking water", service: "Plumbing", hint: "Upload a photo and get an estimate range before booking." },
        { label: "Power problem", service: "Electrical", hint: "Get safe first steps, then book a verified electrician." },
        { label: "AC not cooling", service: "AC Repair", hint: "Find available AC workers and compare ratings." },
        { label: "Deep cleaning", service: "Cleaning", hint: "Pick a time and send photos for better pricing." },
    ];

    const selectedNeedData = quickNeeds.find((item) => item.label === selectedNeed) || quickNeeds[0];

    const promoGameCards = [
        { label: "Quick Fix", code: "FIX10", discount: "10%" },
        { label: "Smart Home", code: "TAZA15", discount: "15%" },
        { label: "Lucky Visit", code: "WIN20", discount: "20%" },
    ];


    function goCustomerSignup(prefillService) {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const searchText = (prefillService || q || "").trim();

        if (token && role === "customer") {
            navigate("/services", { state: { q: searchText } });
            return;
        }

        navigate("/login", {
            state: { tab: "signup", role: "customer", q: searchText },
        });
    }

    function goCustomerLogin() {
        navigate("/login", { state: { tab: "login" } });
    }

    function goWorker() {
        navigate("/login", { state: { tab: "signup", role: "worker" } });
    }

    function requireCustomerLogin(action) {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "customer") {
            toast.info("You have to log in first.");
            navigate("/login", { state: { tab: "login", needLogin: true } });
            return false;
        }

        action?.();
        return true;
    }

    function playPromoGame(index) {
        if (gameStarted) return;

        const prize = promoGameCards[index];
        setGameStarted(true);
        setSelectedGameCard(index);
        setPromoPrize(prize.code);
        localStorage.setItem("promo_code", prize.code);
        localStorage.setItem("promo_discount", prize.discount);
        toast.success(`You won promo code ${prize.code}`);
    }

    function resetPromoGame() {
        setGameStarted(false);
        setSelectedGameCard(null);
    }

    return (
        <div className="lp">
            <div className="lpTopLanding">
                <button
                    className="lpBrand"
                    type="button"
                    onClick={() => navigate("/")}
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                >
                    <img src={logo} alt="logo" className="lpLogo" />
                    <span className="lpBrandName">TAZABEET</span>
                </button>

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

                <div className="lpTopBtns">
                    {isCustomerLoggedIn ? (
                        <button
                            className="lpProfileBtn"
                            type="button"
                            onClick={() => navigate("/customer-profile")}
                            title="Profile"
                        >
                            <span className="lpProfileCircle">👤</span>
                        </button>
                    ) : (
                        <>
                            <button className="lpBtn ghost" onClick={goCustomerLogin} type="button">
                                Log in
                            </button>
                            <button className="lpBtn dark" onClick={goWorker} type="button">
                                Become a Worker
                            </button>
                        </>
                    )}
                </div>
            </div>

            {needLogin ? (
                <div style={{ maxWidth: 1100, margin: "12px auto 0", padding: "0 18px" }}>
                    <div
                        style={{
                            background: "#000",
                            color: "#FFD000",
                            padding: 12,
                            borderRadius: 12,
                            fontWeight: 900,
                        }}
                    >
                        You have to login to access that page.
                    </div>
                </div>
            ) : null}

            <div className="lpHero">
                <div className="lpHeroInner">
                    <div className="lpHeroCopy">
                        <div className="lpLoc">📍 Alexandria, Egypt</div>

                        <div className="lpTitle">
                            <div className="lpTitleA">Book trusted</div>
                            <div className="lpTitleB">Home Services</div>
                        </div>

                        <p className="lpHeroText">
                            Tell us the issue, upload a photo during booking, and get a clear estimated price range before the worker sends the final quote.
                        </p>

                        <div className="lpSearch">
                            <span className="lpSearchIcon">🔎</span>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="lpSearchInput"
                                placeholder="What do you need help with?"
                            />
                            <button className="lpSearchBtn" type="button" onClick={() => goCustomerSignup()}>
                                Search
                            </button>
                        </div>

                        <div className="lpHeroActions">
                            <button type="button" onClick={() => requireCustomerLogin(() => navigate("/services"))}>
                                Book now
                            </button>
                            <button type="button" onClick={() => requireCustomerLogin(() => navigate("/ai-chat"))}>
                                Diagnose first
                            </button>
                        </div>
                    </div>

                    <div className="lpHeroPanel">
                        <div className="lpPanelHeader">
                            <span>Today</span>
                            <b>Smart booking</b>
                        </div>

                        <div className="lpPanelSteps">
                            <div><b>1</b><span>Choose service</span></div>
                            <div><b>2</b><span>Upload photo/video</span></div>
                            <div><b>3</b><span>Approve final price</span></div>
                        </div>

                        <div className="lpHeroStats">
                            <div><b>12</b><span>services</span></div>
                            <div><b>24/7</b><span>urgent help</span></div>
                            <div><b>EGP</b><span>price range</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lpBody">
                <section className="lpFinder">
                    <div>
                        <span className="lpSectionKicker">Start here</span>
                        <h2>What is happening at home?</h2>
                        <p>Tap a common issue and we’ll guide you to the right service.</p>
                    </div>

                    <div className="lpNeedGrid">
                        {quickNeeds.map((item) => (
                            <button
                                type="button"
                                key={item.label}
                                className={selectedNeed === item.label ? "active" : ""}
                                onClick={() => setSelectedNeed(item.label)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="lpNeedResult">
                        <div>
                            <span>Recommended service</span>
                            <b>{selectedNeedData.service}</b>
                            <p>{selectedNeedData.hint}</p>
                        </div>
                        <button type="button" onClick={() => goCustomerSignup(selectedNeedData.service)}>
                            Continue
                        </button>
                    </div>
                </section>

                <div className="lpRow">
                    <div className="lpH2">Categories</div>

                    <button
                        className="lpLink"
                        type="button"
                        onClick={() => {
                            const token = localStorage.getItem("token");
                            const role = localStorage.getItem("role");
                            if (token && role === "customer") navigate("/services");
                            else navigate("/login", { state: { tab: "login", needLogin: true } });
                        }}
                    >
                        See All
                    </button>
                </div>

                <div className="lpCats">
                    {categories.map((c) => (
                        <button
                            key={c.key}
                            className="lpCat"
                            type="button"
                            onClick={() => goCustomerSignup(c.label)}
                            title={c.label}
                        >
                            <div className="lpCatIcon">{c.icon}</div>
                            <div className="lpCatLabel">{c.label}</div>
                        </button>
                    ))}
                </div>

                <div className="lpTrustStrip">
                    <div><b>Verified workers</b><span>Ratings, reviews, and profiles before you book.</span></div>
                    <div><b>Photo pricing</b><span>Upload media so the estimate is closer to the real job.</span></div>
                    <div><b>Admin oversight</b><span>Messages and activity can be monitored for safety.</span></div>
                </div>

                <section className="lpAbout">
                    <div>
                        <span className="lpSectionKicker">About TAZABEET</span>
                        <h2>Built for safer home services in Alexandria</h2>
                        <p>
                            TAZABEET connects customers with trusted local workers through clear booking steps, ratings, monitored messages, price estimates, and final quote approval.
                        </p>
                    </div>
                    <div className="lpAboutGrid">
                        <div><b>For customers</b><span>Find the right service, upload job photos, and approve the final price.</span></div>
                        <div><b>For workers</b><span>Manage schedules, show previous work, and build trust through reviews.</span></div>
                    </div>
                </section>

                <div className="lpPromo">
                    <div className="lpPromoLeft">
                        <div className="lpBadge">New</div>
                        <div className="lpPromoTitle">Not sure what the problem is?</div>
                        <div className="lpPromoSub">Use the AI chat for quick safe steps until the worker arrives.</div>
                        <button className="lpPromoBtn" type="button" onClick={() => requireCustomerLogin(() => navigate("/ai-chat"))}>
                            Open AI Chat
                        </button>
                    </div>
                    <div className="lpPromoRight">
                        <div>
                            <b>Safety first</b>
                            <span>Leaks, sparks, AC issues, appliances, and more.</span>
                        </div>
                    </div>
                </div>

                <section className="lpGame">
                    <div className="lpGameIntro">
                        <span className="lpSectionKicker">Promo game</span>
                        <h2>Pick a card and win a booking discount</h2>
                        <p>Win once, then use the promo code in the booking summary before confirming your service.</p>
                    </div>

                    <div className="lpGameCards">
                        {promoGameCards.map((card, index) => (
                            <button
                                type="button"
                                key={card.code}
                                className={`lpGameCard ${selectedGameCard === index ? "active" : ""}`}
                                onClick={() => playPromoGame(index)}
                            >
                                <span>{gameStarted && selectedGameCard === index ? card.discount : "?"}</span>
                                <b>{gameStarted && selectedGameCard === index ? card.code : card.label}</b>
                            </button>
                        ))}
                    </div>

                    <div className="lpGameResult">
                        {promoPrize ? (
                            <>
                                <div>
                                    Your promo code: <b>{promoPrize}</b>
                                </div>
                                <button type="button" onClick={() => requireCustomerLogin(() => navigate("/services"))}>
                                    Use code
                                </button>
                                <button type="button" onClick={resetPromoGame}>
                                    Play again
                                </button>
                            </>
                        ) : (
                            <span>Choose one card to reveal your discount.</span>
                        )}
                    </div>
                </section>

                <div className="lpHow">
                    <div>
                        <span className="lpSectionKicker">How it works</span>
                        <h2>Book with less guessing</h2>
                    </div>

                    <div className="lpHowGrid">
                        <div><b>Describe</b><span>Add address, notes, and photos.</span></div>
                        <div><b>Estimate</b><span>See a service price range before booking.</span></div>
                        <div><b>Approve</b><span>Worker sends final price, you accept or decline.</span></div>
                    </div>
                </div>

                <div className="lpH2" style={{ marginTop: 26 }}>
                    Top Rated in Alexandria
                </div>

                <div className="lpTopRated">
                    <RatedCard name="Ahmed" job="Plumber" rating="4.9" />
                    <RatedCard name="Mona" job="Electrician" rating="4.8" />
                    <RatedCard name="Khaled" job="AC Technician" rating="4.7" />
                </div>
                <div className="reviewsWrapper">


                    <div className="reviewsSection">
                        <h2 className="reviewsTitle">Customer Reviews</h2>

                        <div className="reviewsWrapper">
                            {reviews.map((review, index) => (
                                <div className="reviewCard" key={index}>

                                    <div className="reviewTop">
                                        <div className="reviewAvatar">
                                            {review.name.charAt(0)}
                                        </div>

                                        <div>
                                            <h3>{review.name}</h3>
                                            <p className="reviewRole">Verified Customer</p>
                                        </div>
                                    </div>

                                    <p className="reviewText">"{review.text}"</p>

                                    <div className="reviewStars">
                                        {"⭐".repeat(Math.floor(review.rating))}
                                        {review.rating % 1 !== 0 && "⭐"}
                                        <span>{review.rating}</span>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lpCTA">
                    <div className="lpCTATitle">Need a service today?</div>
                    <div className="lpCTASub">Create a customer account and book in minutes.</div>
                    <div className="lpCTAButtons">
                        <button
                            className="lpCTAButton"
                            type="button"
                            onClick={() => requireCustomerLogin(() => navigate("/services"))}
                        >
                            Book a Service
                        </button>
                        <button
                            className="lpCTAButton secondary"
                            type="button"
                            onClick={() => navigate("/contact")}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>

                <div className="lpFooterSpace" />
            </div>
            <div className="footer">

                <h2>TAZABEET</h2>
                <p>Your trusted partner for home services in Alexandria.</p>

                <div className="footerIcons">
                    <div><SocialIcon url="https://facebook.com" /></div>
                    <div><SocialIcon url="https://twitter.com" /></div>
                    <div><SocialIcon url="https://instagram.com" /></div>
                </div>

                <div className="footerGrid">
                    <div>
                        <h4>Quick Links</h4>
                        <p onClick={() => navigate("/")}>Home</p>
                        <p onClick={() => navigate("/services")}>Services</p>
                        <p onClick={() => navigate("/ai-chat")}>AI Assistant</p>
                    </div>

                    <div>
                        <h4>Contact</h4>
                        <p>📍 Alexandria</p>
                        <p>📞 +20 100 123 4567</p>
                        <p>✉ help@tazabeet.com</p>
                    </div>
                </div>

                <div className="footerBottom">
                    © 2026 TAZABEET — Designed with ❤️ in Alexandria
                </div>

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

function RatedCard({ name, job, rating }) {
    return (
        <div className="lpRated">
            <div className="lpRatedAvatar">{name.slice(0, 1)}</div>
            <div style={{ flex: 1 }}>
                <div className="lpRatedName">{name}</div>
                <div className="lpRatedJob">{job}</div>
            </div>
            <div className="lpRatedRating">⭐ {rating}</div>
        </div>
    );
}
