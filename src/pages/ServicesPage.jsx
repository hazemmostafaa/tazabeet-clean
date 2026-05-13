import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";
import logo from "../assets/logo.png";
import plumbingImg from "../components/images/plumbing.jpeg";
import electricalImg from "../components/images/electrical.jpeg";
import cleaningImg from "../components/images/cleaning.jpeg";
import paintingImg from "../components/images/painting.jpeg";
import carpentryImg from "../components/images/carpentry.jpeg";
import acImg from "../components/images/ac_repair.jpeg";
import pestImg from "../components/images/pest_control.jpeg";
import carpetsimg from "../components/images/carpets.jpeg";
import alumetalimg from "../components/images/alumetal.jpeg";
import tilingimg from "../components/images/tiling.jpeg";
import gypsumimg from "../components/images/gypsum.jpeg";
import appliancesimg from "../components/images/appliances.jpeg";
import MapPicker from "../components/MapPicker";
import SiteFooter from "../components/SiteFooter";
import { dashboardLocale, formatCurrency, formatPaymentType, formatServiceName, formatSeverity, useDashboardLanguage } from "../utils/dashboardI18n";
import "leaflet/dist/leaflet.css";

export default function ServicesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, isArabic, setLanguage, t } = useDashboardLanguage();
    const [showNav, setShowNav] = useState(true);
    const [locationCoords, setLocationCoords] = useState(null);
    const [address, setAddress] = useState("");
    const [serviceSearch, setServiceSearch] = useState(location.state?.q || "");
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
    const serviceImages = {
        Plumbing: plumbingImg,
        Electrical: electricalImg,
        Cleaning: cleaningImg,
        Painting: paintingImg,
        Carpentry: carpentryImg,
        "AC Repair": acImg,
        "Pest Control": pestImg,
        Carpets: carpetsimg,
        Alumetal: alumetalimg,
        Tiling: tilingimg,
        "Gypsum Boards": gypsumimg,
        Appliances: appliancesimg
    };
    const [paymentType, setPaymentType] = useState("cash");
    const [selectedService, setSelectedService] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [workersByService, setWorkersByService] = useState({});
    const [availableByService, setAvailableByService] = useState({});
    const [bookingStep, setBookingStep] = useState(1);
    const [showMap, setShowMap] = useState(false);
    const [addressTouched, setAddressTouched] = useState(false);
    const [issueDescription, setIssueDescription] = useState("");
    const [bookingFiles, setBookingFiles] = useState([]);
    const [promoCode, setPromoCode] = useState(() => localStorage.getItem("promo_code") || "");
    const [promoInfo, setPromoInfo] = useState(null);

    const services = [
        "Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry",
        "AC Repair", "Pest Control", "Carpets", "Alumetal",
        "Tiling", "Gypsum Boards", "Appliances"
    ];

    const priceTable = {
        Plumbing: { min: 300, max: 900 },
        Electrical: { min: 250, max: 850 },
        Cleaning: { min: 300, max: 1200 },
        Painting: { min: 1000, max: 5000 },
        Carpentry: { min: 500, max: 3000 },
        "AC Repair": { min: 400, max: 1500 },
        "Pest Control": { min: 600, max: 1800 },
        Carpets: { min: 250, max: 1000 },
        Alumetal: { min: 800, max: 4000 },
        Tiling: { min: 1000, max: 6000 },
        "Gypsum Boards": { min: 1200, max: 6500 },
        Appliances: { min: 350, max: 1800 },
    };

    function estimatePrice(service, description = "", files = []) {
        const base = priceTable[service] || { min: 300, max: 1500 };
        const text = description.toLowerCase();
        const emergencyWords = ["emergency", "urgent", "flood", "fire", "spark", "burn", "smoke", "gas", "كهرب", "حريق", "دخان", "تسريب كبير"];
        const bigWords = ["big", "broken", "replace", "whole", "many", "large", "كبير", "تغيير", "مكسور"];
        const smallWords = ["small", "simple", "minor", "صغير", "بسيط"];
        let multiplier = 1;
        let severity = files.length ? "photo review" : "medium";

        if (emergencyWords.some((word) => text.includes(word))) {
            multiplier = 1.35;
            severity = "urgent";
        } else if (bigWords.some((word) => text.includes(word))) {
            multiplier = 1.2;
            severity = "large";
        } else if (smallWords.some((word) => text.includes(word))) {
            multiplier = 0.85;
            severity = "small";
        }

        return {
            min: Math.round((base.min * multiplier) / 25) * 25,
            max: Math.round((base.max * multiplier) / 25) * 25,
            severity,
            currency: "EGP",
        };
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function buildBookingMedia() {
        return Promise.all(
            bookingFiles.map(async (file) => ({
                name: file.name,
                type: file.type.startsWith("video/") ? "video" : "image",
                url: await readFileAsDataUrl(file),
            }))
        );
    }

    function getPromoDiscount(code) {
        const normalized = code.trim().toUpperCase();
        return promoInfo?.code === normalized ? promoInfo.discountPercent : 0;
    }

    function applyPromo(estimate, code) {
        const discount = getPromoDiscount(code);
        if (!estimate || !discount) return estimate;

        return {
            ...estimate,
            originalMin: estimate.min,
            originalMax: estimate.max,
            min: Math.max(0, Math.round(estimate.min * (100 - discount) / 100)),
            max: Math.max(0, Math.round(estimate.max * (100 - discount) / 100)),
            discount,
        };
    }

    const rawEstimatePreview = selectedService
        ? estimatePrice(selectedService, issueDescription, bookingFiles)
        : null;
    const estimatePreview = applyPromo(rawEstimatePreview, promoCode);

    async function validatePromoCode() {
        const normalized = promoCode.trim().toUpperCase();
        if (!normalized) return;

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/schedule/promo/${normalized}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();

            if (!res.ok) {
                setPromoInfo(null);
                return toast.error(res.status === 409 ? t("servicesPage.usedPromo") : data.message || t("servicesPage.invalidPromo"));
            }

            setPromoInfo(data);
            setPromoCode(data.code);
            localStorage.setItem("promo_code", data.code);
            toast.success(`${data.discountPercent}% ${t("servicesPage.promoApplied")}`);
        } catch (err) {
            console.log(err);
            toast.error(t("servicesPage.invalidPromo"));
        }
    }

    useEffect(() => {
        fetchWorkers();
    }, []);
    useEffect(() => {
        if (location.state?.service) {
            openBooking(location.state.service);
        }
        if (location.state?.q) {
            setServiceSearch(location.state.q);
        }
    }, [location.state]);
    async function fetchWorkers() {
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            };

            const [workersRes, availableRes] = await Promise.all([
                fetch("https://tazabeet-backend.vibenest.net/api/schedule/workers-by-service", { headers }),
                fetch("https://tazabeet-backend.vibenest.net/api/schedule/available", { headers }),
            ]);

            const workersData = await workersRes.json();
            const availableData = await availableRes.json();

            if (!workersRes.ok) return;

            setWorkersByService(workersData || {});

            const availableGrouped = {};

            if (availableRes.ok && Array.isArray(availableData)) {
                availableData.forEach((slot) => {
                    availableGrouped[slot.service] = (availableGrouped[slot.service] || 0) + 1;
                });
            }

            setAvailableByService(availableGrouped);

        } catch (err) {
            console.log(err);
        }
    }

    async function openBooking(service) {
        setSelectedService(service);
        setSelectedSlot(null);
        setBookingStep(1);
        setShowMap(false);
        setAddressTouched(false);
        setIssueDescription("");
        setBookingFiles([]);

        try {
            const res = await fetch(
                `https://tazabeet-backend.vibenest.net/api/schedule/available?service=${service}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok) return;

            const sortedSlots = [...data].sort((a, b) => {
                const ratingDiff = (b.worker?.rating || 0) - (a.worker?.rating || 0);
                if (ratingDiff !== 0) return ratingDiff;

                return new Date(a.date) - new Date(b.date);
            });

            setAvailableSlots(sortedSlots);

        } catch (err) {
            console.log(err);
        }
    }

    async function handleConfirmBooking() {
        if (!selectedSlot) return toast.error(t("servicesPage.selectSlot"));
        const bookingAddress = address.trim();

        if (!bookingAddress) return toast.error(t("servicesPage.enterAddress"));

        const bookingLocation = locationCoords
            ? {
                lat: locationCoords.lat,
                lng: locationCoords.lng,
            }
            : null;

        try {
            setLoading(true);

            const res = await fetch(
                `https://tazabeet-backend.vibenest.net/api/schedule/book/${selectedSlot._id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        paymentType,
                        address: bookingAddress,
                        location: bookingLocation,
                        description: issueDescription,
                        bookingMedia: await buildBookingMedia(),
                        promoCode,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) return toast.error(data.message || t("servicesPage.bookingFailed"));

            const estimateText = data.estimatedPrice
                ? ` ${t("customer.estimate")} ${data.estimatedPrice.min}-${data.estimatedPrice.max} ${formatCurrency(language, data.estimatedPrice.currency)}.`
                : "";
            toast.success(`${t("servicesPage.bookingSent")}${estimateText}`);

            setSelectedService(null);
            setSelectedSlot(null);
            setAvailableSlots([]);
            setAddress("");
            setLocationCoords(null);
            setBookingStep(1);
            setShowMap(false);
            setAddressTouched(false);
            setIssueDescription("");
            setBookingFiles([]);
            setPromoInfo(null);
            setPromoCode("");
            localStorage.removeItem("promo_code");

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    function closeBooking() {
        setSelectedService(null);
        setSelectedSlot(null);
        setAvailableSlots([]);
        setBookingStep(1);
        setShowMap(false);
        setAddressTouched(false);
        setIssueDescription("");
        setBookingFiles([]);
    }

    function handleBookingFiles(e) {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((file) =>
            file.type.startsWith("image/") || file.type.startsWith("video/")
        );

        if (validFiles.length !== files.length) {
            toast.error(t("servicesPage.photosOnly"));
        }

        setBookingFiles(validFiles.slice(0, 3));
        e.target.value = "";
    }

    function goToSlotStep() {
        setAddressTouched(true);

        if (!address.trim()) {
            toast.error(t("servicesPage.enterAddress"));
            return;
        }

        setBookingStep(2);
    }

    function goToSummaryStep() {
        if (!selectedSlot) {
            toast.error(t("servicesPage.selectWorkerTime"));
            return;
        }

        setBookingStep(3);
    }

    const filteredServices = services.filter((service) =>
        service.toLowerCase().includes(serviceSearch.trim().toLowerCase()) ||
        formatServiceName(language, service).toLowerCase().includes(serviceSearch.trim().toLowerCase())
    );

    return (

        <div className={`lp ${isArabic ? "rtl" : ""}`} dir={isArabic ? "rtl" : "ltr"}>


            <div className="lpTopLanding">
                <button className="lpBrand" onClick={() => navigate("/")}>
                    <img src={logo} alt="logo" className="lpLogo" />
                    <span className="lpBrandName">TAZABEET</span>
                </button>

                <div className="lpDesktopNav">
                    <button onClick={() => navigate("/")}>{t("site.home")}</button>
                    <button className="active">{t("site.services")}</button>
                    <button onClick={() => navigate("/ai-chat")}>{t("site.aiChat")}</button>
                    <button onClick={() => navigate("/contact")}>{t("site.contact")}</button>
                </div>


                <div className="lpTopBtns">
                    <button
                        type="button"
                        className="dashboardLangToggle"
                        onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                    >
                        🌐 {t("common.languageToggle")}
                    </button>
                    <button
                        className="lpProfileBtn"
                        onClick={() => navigate("/customer-profile")}
                    >
                        <span className="lpProfileCircle">👤</span>
                    </button>
                </div>
            </div>


            <div className="lpHero">
                <div className="lpHeroInner">
                    <div className="lpTitle">
                        <div className="lpTitleA">{t("servicesPage.heroA")}</div>
                        <div className="lpTitleB">{t("servicesPage.heroB")}</div>
                    </div>
                </div>
            </div>


            <div className="lpBody">
                <div className="servicesToolbar">
                    <div>
                        <h2>{t("servicesPage.availableServices")}</h2>
                        <p>{t("servicesPage.searchHelp")}</p>
                    </div>

                    <input
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder={t("servicesPage.searchPlaceholder")}
                    />
                </div>

                <div className="serviceChips">
                    <button
                        type="button"
                        className={!serviceSearch ? "active" : ""}
                        onClick={() => setServiceSearch("")}
                    >
                        {t("servicesPage.all")}
                    </button>
                    {services.map((service) => (
                        <button
                            type="button"
                            key={service}
                            className={serviceSearch === service ? "active" : ""}
                            onClick={() => setServiceSearch(service)}
                        >
                            {formatServiceName(language, service)}
                        </button>
                    ))}
                </div>

                {filteredServices.length === 0 ? (
                    <div className="serviceEmpty">
                        <b>{t("servicesPage.noMatching")}</b>
                        <span>{t("servicesPage.tryAnother")}</span>
                    </div>
                ) : filteredServices.map((service, i) => {

                    const workers = workersByService[service] || [];
                    const worker = workers[0];
                    const availableCount = availableByService[service] || 0;

                    return (
                        <div className="serviceCard" key={i}>
                            <div className="serviceImgWrapper">
                                <img
                                    src={serviceImages[service]}
                                    className="serviceImg"
                                    alt={formatServiceName(language, service)}
                                />
                            </div>

                            <div className="serviceContent">
                                <h3>{formatServiceName(language, service)}</h3>

                                {workers.length > 0 ? (
                                    worker?.feedbacks?.filter(r => r.review).length > 0 ? (
                                        <div className="serviceReviewPreview">
                                            {worker.feedbacks
                                                .filter(r => r.review)
                                                .slice(0, 1)
                                                .map((r) => (
                                                    <p key={r._id || r.review}>
                                                        “{r.review}”
                                                    </p>
                                                ))}
                                        </div>
                                    ) : null
                                ) : (
                                    <div className="serviceEmpty small">
                                        <b>{t("servicesPage.noPreviousWorkers")}</b>
                                        <span>{t("servicesPage.workersLater")}</span>
                                    </div>
                                )}

                                <button
                                    className="bookBtn"
                                    onClick={() => openBooking(service)}
                                    disabled={!availableCount}
                                >
                                    {availableCount ? t("servicesPage.bookNow") : t("servicesPage.noSlots")}
                                </button>

                                {workers.length > 0 && (
                                    <div className="serviceWorkersBottom">
                                        <div className="serviceWorkerHeader">
                                            <span>{workers.length} {workers.length === 1 ? t("servicesPage.previousWorker") : t("servicesPage.previousWorkers")}</span>
                                            <small>{availableCount} {availableCount === 1 ? t("servicesPage.availableSlot") : t("servicesPage.availableSlots")}</small>
                                        </div>

                                        <div className="serviceWorkersList">
                                            {workers.map((serviceWorker) => (
                                                <button
                                                    type="button"
                                                    className="workerRow serviceWorkerOption"
                                                    key={serviceWorker._id}
                                                    onClick={() => navigate(`/worker/${serviceWorker._id}`)}
                                                >
                                                    <div className="workerAvatar">
                                                        {serviceWorker.name?.charAt(0)}
                                                    </div>
                                                    <div className="serviceWorkerInfo">
                                                        <div className="workerName">
                                                            {serviceWorker.name}
                                                        </div>
                                                        <div className="workerJob">
                                                            {serviceWorker.completedJobs || 0} {serviceWorker.completedJobs === 1 ? t("servicesPage.completedJob") : t("servicesPage.completedJobs")}
                                                        </div>
                                                    </div>
                                                    <div className="rating">
                                                        ⭐ {serviceWorker.rating || 0}
                                                        <span>({serviceWorker.totalReviews || 0})</span>
                                                    </div>
                                                    {serviceWorker.feedbacks?.filter(r => r.review).length > 0 && (
                                                        <div className="workerFeedbacks">
                                                            {serviceWorker.feedbacks
                                                                .filter(r => r.review)
                                                                .slice(0, 2)
                                                                .map((feedback) => (
                                                                    <p key={feedback._id}>
                                                                        <b>⭐ {feedback.rating}</b> {feedback.review}
                                                                        <span>{feedback.customerName}</span>
                                                                    </p>
                                                                ))}
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>


            {selectedService && (
                <div className="modalOverlay">
                    <div className="modalBox bookingModal">
                        <button className="modalClose" type="button" onClick={closeBooking}>×</button>

                        <div className="bookingHeader">
                            <div>
                                <span>{t("servicesPage.booking")}</span>
                                <h3>{formatServiceName(language, selectedService)}</h3>
                            </div>
                            <div className="bookingSteps">
                                {[1, 2, 3].map((step) => (
                                    <button
                                        type="button"
                                        key={step}
                                        className={bookingStep === step ? "active" : ""}
                                        onClick={() => {
                                            if (step === 1) setBookingStep(1);
                                            if (step === 2) goToSlotStep();
                                            if (step === 3) goToSummaryStep();
                                        }}
                                    >
                                        {step}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {bookingStep === 1 && (
                            <div className="bookingStep">
                                <label>{t("servicesPage.address")}</label>
                                <input
                                    className={addressTouched && !address.trim() ? "fieldError" : ""}
                                    placeholder={t("servicesPage.enterAddress")}
                                    value={address}
                                    onBlur={() => setAddressTouched(true)}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {addressTouched && !address.trim() && (
                                    <div className="inlineError">{t("servicesPage.addressRequired")}</div>
                                )}

                                <button
                                    type="button"
                                    className="mapToggle"
                                    onClick={() => setShowMap((prev) => !prev)}
                                >
                                    {showMap ? t("servicesPage.hideMap") : t("servicesPage.addMap")}
                                </button>

                                {showMap && <MapPicker setLocation={setLocationCoords} />}

                                {locationCoords && (
                                    <p className="locationPreview">
                                        📍 {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}
                                    </p>
                                )}

                                <label>{t("servicesPage.describeWork")}</label>
                                <textarea
                                    className="bookingTextarea"
                                    placeholder={t("servicesPage.describePlaceholder")}
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                />

                                <label>{t("servicesPage.mediaLabel")}</label>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleBookingFiles}
                                />

                                {bookingFiles.length > 0 && (
                                    <div className="bookingFileList">
                                        {bookingFiles.map((file) => (
                                            <span key={`${file.name}-${file.size}`}>{file.name}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="modalActions">
                                    <button className="confirmBtn" type="button" onClick={goToSlotStep}>
                                        {t("servicesPage.continue")}
                                    </button>
                                </div>
                            </div>
                        )}

                        {bookingStep === 2 && (
                            <div className="bookingStep">
                                <div className="stepTitleRow">
                                    <h4>{t("servicesPage.chooseWorkerTime")}</h4>
                                    <span>{availableSlots.length} {t("servicesPage.slots")}</span>
                                </div>

                                {availableSlots.length === 0 ? (
                                    <div className="serviceEmpty">
                                        <b>{t("servicesPage.noSlotsNow")}</b>
                                        <span>{t("servicesPage.checkLater")}</span>
                                    </div>
                                ) : (
                                    <div className="slotList">
                                        {availableSlots.map((slot) => (
                                            <button
                                                type="button"
                                                key={slot._id}
                                                className={`slotCard ${selectedSlot?._id === slot._id ? "active" : ""}`}
                                                onClick={() => setSelectedSlot(slot)}
                                            >
                                                <div className="slotWorker">
                                                    <span>{slot.worker?.name?.charAt(0) || "W"}</span>
                                                    <div>
                                                        <b>{slot.worker?.name || t("servicesPage.worker")}</b>
                                                        <small>⭐ {slot.worker?.rating || 0} ({slot.worker?.totalReviews || 0})</small>
                                                    </div>
                                                </div>

                                                <div className="slotMeta">
                                                    <span>📅 {new Date(slot.date).toLocaleDateString(dashboardLocale(language))}</span>
                                                    <span>⏰ {slot.startTime} - {slot.endTime}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="modalActions split">
                                    <button className="cancelBtn" type="button" onClick={() => setBookingStep(1)}>
                                        {t("common.back")}
                                    </button>
                                    <button className="confirmBtn" type="button" onClick={goToSummaryStep}>
                                        {t("servicesPage.continue")}
                                    </button>
                                </div>
                            </div>
                        )}

                        {bookingStep === 3 && (
                            <div className="bookingStep">
                                <label>{t("servicesPage.paymentMethod")}</label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                >
                                    <option value="cash">{t("common.cash")}</option>
                                    <option value="vodafone_cash">{formatPaymentType(language, "vodafone_cash")}</option>
                                    <option value="instapay">{formatPaymentType(language, "instapay")}</option>
                                    <option value="fawry">{formatPaymentType(language, "fawry")}</option>
                                </select>

                                <label>{t("servicesPage.promoCode")}</label>
                                <div className="promoCodeRow">
                                    <input
                                        value={promoCode}
                                        onChange={(e) => {
                                            setPromoCode(e.target.value.toUpperCase());
                                            setPromoInfo(null);
                                        }}
                                        placeholder={t("servicesPage.promoPlaceholder")}
                                    />
                                    <button
                                        type="button"
                                        onClick={validatePromoCode}
                                    >
                                        {t("servicesPage.apply")}
                                    </button>
                                </div>

                                <div className="bookingSummary">
                                    <h4>{t("servicesPage.bookingSummary")}</h4>
                                    <div><span>{t("servicesPage.service")}</span><b>{formatServiceName(language, selectedService)}</b></div>
                                    <div><span>{t("servicesPage.worker")}</span><b>{selectedSlot?.worker?.name || t("common.notAvailable")}</b></div>
                                    <div><span>{t("servicesPage.date")}</span><b>{selectedSlot ? new Date(selectedSlot.date).toLocaleDateString(dashboardLocale(language)) : t("common.notAvailable")}</b></div>
                                    <div><span>{t("servicesPage.time")}</span><b>{selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : t("common.notAvailable")}</b></div>
                                    <div><span>{t("servicesPage.address")}</span><b>{address.trim()}</b></div>
                                    <div><span>{t("servicesPage.media")}</span><b>{bookingFiles.length || t("servicesPage.no")} {bookingFiles.length === 1 ? t("servicesPage.file") : t("servicesPage.files")}</b></div>
                                    <div><span>{t("servicesPage.payment")}</span><b>{formatPaymentType(language, paymentType)}</b></div>
                                    {promoCode && getPromoDiscount(promoCode) > 0 && (
                                        <div><span>{t("servicesPage.promo")}</span><b>{promoCode.trim().toUpperCase()} - {getPromoDiscount(promoCode)}%</b></div>
                                    )}
                                    {estimatePreview && (
                                        <div>
                                            <span>{t("servicesPage.estimate")}</span>
                                            <b>
                                                {estimatePreview.min} - {estimatePreview.max} {formatCurrency(language, estimatePreview.currency)}
                                            </b>
                                        </div>
                                    )}
                                </div>

                                {estimatePreview && (
                                    <div className="priceEstimateBox">
                                        {estimatePreview.discount && (
                                            <span>
                                                {t("servicesPage.beforePromo")}: {estimatePreview.originalMin} - {estimatePreview.originalMax} {formatCurrency(language, estimatePreview.currency)}
                                            </span>
                                        )}
                                        <b>{t("servicesPage.estimatedRange")}: {estimatePreview.min} - {estimatePreview.max} {formatCurrency(language, estimatePreview.currency)}</b>
                                        <span>{t("servicesPage.severity")}: {formatSeverity(language, estimatePreview.severity)}</span>
                                        <p>{t("servicesPage.finalPriceNote")}</p>
                                    </div>
                                )}

                                <div className="modalActions split">
                                    <button className="cancelBtn" type="button" onClick={() => setBookingStep(2)}>
                                        {t("common.back")}
                                    </button>
                                    <button
                                        className="confirmBtn"
                                        onClick={handleConfirmBooking}
                                        disabled={loading}
                                    >
                                        {loading ? `${t("servicesPage.booking")}...` : t("servicesPage.confirmBooking")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
