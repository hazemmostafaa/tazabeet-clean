import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";
import logo from "../assets/logo.png";
import SiteFooter from "../components/SiteFooter";
import { formatServiceName, useDashboardLanguage } from "../utils/dashboardI18n";
export default function LandingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, isArabic, setLanguage, t } = useDashboardLanguage();
    const [reviews, setReviews] = useState([]);
    const [showNav, setShowNav] = useState(true);
    const [selectedNeed, setSelectedNeed] = useState("leaking");
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

    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch("https://tazabeet-backend.vibenest.net/api/schedule/public-reviews");
                const data = await res.json();
                if (res.ok) setReviews(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log(err);
            }
        }

        fetchReviews();
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
        { key: "leaking", label: language === "ar" ? "تسريب مياه" : "Leaking water", service: "Plumbing", hint: language === "ar" ? "ارفع صورة واحصل على تقدير للسعر قبل الحجز." : "Upload a photo and get an estimate range before booking." },
        { key: "power", label: language === "ar" ? "مشكلة كهرباء" : "Power problem", service: "Electrical", hint: language === "ar" ? "احصل على خطوات أمان سريعة ثم احجز كهربائيا موثقا." : "Get safe first steps, then book a verified electrician." },
        { key: "ac", label: language === "ar" ? "التكييف لا يبرد" : "AC not cooling", service: "AC Repair", hint: language === "ar" ? "اعثر على عمال تكييف متاحين وقارن التقييمات." : "Find available AC workers and compare ratings." },
        { key: "cleaning", label: language === "ar" ? "تنظيف عميق" : "Deep cleaning", service: "Cleaning", hint: language === "ar" ? "اختر موعدا وارسل صورا لتسعير أفضل." : "Pick a time and send photos for better pricing." },
    ];

    const selectedNeedData = quickNeeds.find((item) => item.key === selectedNeed) || quickNeeds[0];

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
            toast.info(t("landing.loginFirst"));
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
        toast.success(`${t("landing.promoWon")} ${prize.code}`);
    }

    function resetPromoGame() {
        setGameStarted(false);
        setSelectedGameCard(null);
    }

    return (
        <div className={`lp ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
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
                </div>

                <div className="lpTopBtns">
                    <button
                        type="button"
                        className="dashboardLangToggle"
                        onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                    >
                        🌐 {t("common.languageToggle")}
                    </button>
                    {isCustomerLoggedIn ? (
                        <button
                            className="lpProfileBtn"
                            type="button"
                            onClick={() => navigate("/customer-profile")}
                            title={t("site.profile")}
                        >
                            <span className="lpProfileCircle">👤</span>
                        </button>
                    ) : (
                        <>
                            <button className="lpBtn ghost" onClick={goCustomerLogin} type="button">
                                {t("site.login")}
                            </button>
                            <button className="lpBtn dark" onClick={goWorker} type="button">
                                {t("site.becomeWorker")}
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
                        {t("landing.loginRequired")}
                    </div>
                </div>
            ) : null}

            <div className="lpHero">
                <div className="lpHeroInner">
                    <div className="lpHeroCopy">
                        <div className="lpLoc">📍 {t("landing.location")}</div>

                        <div className="lpTitle">
                            <div className="lpTitleA">{t("landing.titleA")}</div>
                            <div className="lpTitleB">{t("landing.titleB")}</div>
                        </div>

                        <p className="lpHeroText">
                            {t("landing.heroText")}
                        </p>

                        <div className="lpSearch">
                            <span className="lpSearchIcon">🔎</span>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="lpSearchInput"
                                placeholder={t("landing.searchPlaceholder")}
                            />
                            <button className="lpSearchBtn" type="button" onClick={() => goCustomerSignup()}>
                                {t("landing.search")}
                            </button>
                        </div>

                        <div className="lpHeroActions">
                            <button type="button" onClick={() => requireCustomerLogin(() => navigate("/services"))}>
                                {t("landing.bookNow")}
                            </button>
                            <button type="button" onClick={() => requireCustomerLogin(() => navigate("/ai-chat"))}>
                                {t("landing.diagnoseFirst")}
                            </button>
                        </div>
                    </div>

                    <div className="lpHeroPanel">
                        <div className="lpPanelHeader">
                            <span>{t("landing.today")}</span>
                            <b>{t("landing.smartBooking")}</b>
                        </div>

                        <div className="lpPanelSteps">
                            <div><b>1</b><span>{t("landing.chooseService")}</span></div>
                            <div><b>2</b><span>{t("landing.uploadMedia")}</span></div>
                            <div><b>3</b><span>{t("landing.approveFinalPrice")}</span></div>
                        </div>

                        <div className="lpHeroStats">
                            <div><b>12</b><span>{t("landing.servicesCount")}</span></div>
                            <div><b>24/7</b><span>{t("landing.urgentHelp")}</span></div>
                            <div><b>{t("common.egp")}</b><span>{t("landing.priceRange")}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lpBody">
                <section className="lpFinder">
                    <div>
                        <span className="lpSectionKicker">{t("landing.startHere")}</span>
                        <h2>{t("landing.issueTitle")}</h2>
                        <p>{t("landing.issueText")}</p>
                    </div>

                    <div className="lpNeedGrid">
                        {quickNeeds.map((item) => (
                            <button
                                type="button"
                                key={item.key}
                                className={selectedNeed === item.key ? "active" : ""}
                                onClick={() => setSelectedNeed(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="lpNeedResult">
                        <div>
                            <span>{t("landing.recommendedService")}</span>
                            <b>{formatServiceName(language, selectedNeedData.service)}</b>
                            <p>{selectedNeedData.hint}</p>
                        </div>
                        <button type="button" onClick={() => goCustomerSignup(selectedNeedData.service)}>
                            {t("landing.continue")}
                        </button>
                    </div>
                </section>

                <div className="lpRow">
                    <div className="lpH2">{t("landing.categories")}</div>

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
                        {t("landing.seeAll")}
                    </button>
                </div>

                <div className="lpCats">
                    {categories.map((c) => (
                        <button
                            key={c.key}
                            className="lpCat"
                            type="button"
                            onClick={() => goCustomerSignup(c.label)}
                            title={formatServiceName(language, c.label)}
                        >
                            <div className="lpCatIcon">{c.icon}</div>
                            <div className="lpCatLabel">{formatServiceName(language, c.label)}</div>
                        </button>
                    ))}
                </div>

                <div className="lpTrustStrip">
                    <div><b>{t("landing.verifiedWorkers")}</b><span>{t("landing.verifiedWorkersText")}</span></div>
                    <div><b>{t("landing.photoPricing")}</b><span>{t("landing.photoPricingText")}</span></div>
                    <div><b>{t("landing.adminOversight")}</b><span>{t("landing.adminOversightText")}</span></div>
                </div>

                <section className="lpAbout">
                    <div>
                        <span className="lpSectionKicker">{t("landing.aboutKicker")}</span>
                        <h2>{t("landing.aboutTitle")}</h2>
                        <p>
                            {t("landing.aboutText")}
                        </p>
                    </div>
                    <div className="lpAboutGrid">
                        <div><b>{t("landing.forCustomers")}</b><span>{t("landing.forCustomersText")}</span></div>
                        <div><b>{t("landing.forWorkers")}</b><span>{t("landing.forWorkersText")}</span></div>
                    </div>
                </section>

                <div className="lpPromo">
                    <div className="lpPromoLeft">
                        <div className="lpBadge">{t("landing.newBadge")}</div>
                        <div className="lpPromoTitle">{t("landing.aiTitle")}</div>
                        <div className="lpPromoSub">{t("landing.aiText")}</div>
                        <button className="lpPromoBtn" type="button" onClick={() => requireCustomerLogin(() => navigate("/ai-chat"))}>
                            {t("landing.openAi")}
                        </button>
                    </div>
                    <div className="lpPromoRight">
                        <div>
                            <b>{t("landing.safetyFirst")}</b>
                            <span>{t("landing.safetyText")}</span>
                        </div>
                    </div>
                </div>

                <section className="lpGame">
                    <div className="lpGameIntro">
                        <span className="lpSectionKicker">{t("landing.promoKicker")}</span>
                        <h2>{t("landing.promoTitle")}</h2>
                        <p>{t("landing.promoText")}</p>
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
                                    {t("landing.promoCode")}: <b>{promoPrize}</b>
                                </div>
                                <button type="button" onClick={() => requireCustomerLogin(() => navigate("/services"))}>
                                    {t("landing.useCode")}
                                </button>
                                <button type="button" onClick={resetPromoGame}>
                                    {t("landing.playAgain")}
                                </button>
                            </>
                        ) : (
                            <span>{t("landing.chooseCard")}</span>
                        )}
                    </div>
                </section>

                <div className="lpHow">
                    <div>
                        <span className="lpSectionKicker">{t("landing.howKicker")}</span>
                        <h2>{t("landing.howTitle")}</h2>
                    </div>

                    <div className="lpHowGrid">
                        <div><b>{t("landing.describe")}</b><span>{t("landing.describeText")}</span></div>
                        <div><b>{t("landing.estimate")}</b><span>{t("landing.estimateText")}</span></div>
                        <div><b>{t("landing.approve")}</b><span>{t("landing.approveText")}</span></div>
                    </div>
                </div>

                <div className="lpH2" style={{ marginTop: 26 }}>
                    {t("landing.topRated")}
                </div>

                <div className="lpTopRated">
                    <RatedCard name="Ahmed" job={formatServiceName(language, "Plumbing")} rating="4.9" />
                    <RatedCard name="Mona" job={formatServiceName(language, "Electrical")} rating="4.8" />
                    <RatedCard name="Khaled" job={formatServiceName(language, "AC Repair")} rating="4.7" />
                </div>
                <div className="reviewsWrapper">


                    <div className="reviewsSection">
                        <h2 className="reviewsTitle">{t("landing.reviews")}</h2>

                        <div className="reviewsWrapper">
                            {reviews.length === 0 ? (
                                <p>{t("landing.noReviews")}</p>
                            ) : reviews.map((review, index) => (
                                <div className="reviewCard" key={review._id || index}>

                                    <div className="reviewTop">
                                        <div className="reviewAvatar">
                                            {review.name.charAt(0)}
                                        </div>

                                        <div>
                                            <h3>{review.name}</h3>
                                            <p className="reviewRole">{t("landing.verifiedCustomer")}</p>
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
                    <div className="lpCTATitle">{t("landing.ctaTitle")}</div>
                    <div className="lpCTASub">{t("landing.ctaText")}</div>
                    <div className="lpCTAButtons">
                        <button
                            className="lpCTAButton"
                            type="button"
                            onClick={() => requireCustomerLogin(() => navigate("/services"))}
                        >
                            {t("landing.bookService")}
                        </button>
                        <button
                            className="lpCTAButton secondary"
                            type="button"
                            onClick={() => navigate("/contact")}
                        >
                            {t("landing.contactUs")}
                        </button>
                    </div>
                </div>

            </div>
            <SiteFooter language={language} t={t} />
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
