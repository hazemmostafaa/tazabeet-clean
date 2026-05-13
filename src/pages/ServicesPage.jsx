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
import "leaflet/dist/leaflet.css";

export default function ServicesPage() {
    const navigate = useNavigate();
    const location = useLocation();
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
        if (normalized === "FIX10") return 10;
        if (normalized === "TAZA15") return 15;
        if (normalized === "WIN20") return 20;
        return 0;
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
        if (!selectedSlot) return toast.error("Select a slot.");
        const bookingAddress = address.trim();

        if (!bookingAddress) return toast.error("Enter your address.");

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
            if (!res.ok) return toast.error(data.message || "Booking failed.");

            const estimateText = data.estimatedPrice
                ? ` Estimated ${data.estimatedPrice.min}-${data.estimatedPrice.max} ${data.estimatedPrice.currency}.`
                : "";
            toast.success(`Booking sent.${estimateText}`);

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
            toast.error("Only photos and videos are allowed.");
        }

        setBookingFiles(validFiles.slice(0, 3));
        e.target.value = "";
    }

    function goToSlotStep() {
        setAddressTouched(true);

        if (!address.trim()) {
            toast.error("Enter your address.");
            return;
        }

        setBookingStep(2);
    }

    function goToSummaryStep() {
        if (!selectedSlot) {
            toast.error("Select a worker and time.");
            return;
        }

        setBookingStep(3);
    }

    const filteredServices = services.filter((service) =>
        service.toLowerCase().includes(serviceSearch.trim().toLowerCase())
    );

    return (

        <div className="lp">


            <div className="lpTopLanding">
                <button className="lpBrand" onClick={() => navigate("/")}>
                    <img src={logo} alt="logo" className="lpLogo" />
                    <span className="lpBrandName">TAZABEET</span>
                </button>

                <div className="lpDesktopNav">
                    <button onClick={() => navigate("/")}>Home</button>
                    <button className="active">Services</button>
                    <button onClick={() => navigate("/ai-chat")}>AI Chat</button>
                    <button onClick={() => navigate("/contact")}>Contact</button>
                </div>


                <div className="lpTopBtns">
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
                        <div className="lpTitleA">Our Services</div>
                        <div className="lpTitleB">Choose What You Need</div>
                    </div>
                </div>
            </div>


            <div className="lpBody">
                <div className="servicesToolbar">
                    <div>
                        <h2>Available Services</h2>
                        <p>Search by service and book the best available slot.</p>
                    </div>

                    <input
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder="Search services..."
                    />
                </div>

                <div className="serviceChips">
                    <button
                        type="button"
                        className={!serviceSearch ? "active" : ""}
                        onClick={() => setServiceSearch("")}
                    >
                        All
                    </button>
                    {services.map((service) => (
                        <button
                            type="button"
                            key={service}
                            className={serviceSearch === service ? "active" : ""}
                            onClick={() => setServiceSearch(service)}
                        >
                            {service}
                        </button>
                    ))}
                </div>

                {filteredServices.length === 0 ? (
                    <div className="serviceEmpty">
                        <b>No matching services.</b>
                        <span>Try another keyword or browse all services.</span>
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
                                    alt={service}
                                />
                            </div>

                            <div className="serviceContent">
                                <h3>{service}</h3>

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
                                        <b>No previous workers yet.</b>
                                        <span>Workers will appear here after they add this service.</span>
                                    </div>
                                )}

                                <button
                                    className="bookBtn"
                                    onClick={() => openBooking(service)}
                                    disabled={!availableCount}
                                >
                                    {availableCount ? "Book Now" : "No slots available"}
                                </button>

                                {workers.length > 0 && (
                                    <div className="serviceWorkersBottom">
                                        <div className="serviceWorkerHeader">
                                            <span>{workers.length} previous worker{workers.length === 1 ? "" : "s"}</span>
                                            <small>{availableCount} available slot{availableCount === 1 ? "" : "s"}</small>
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
                                                            {serviceWorker.completedJobs || 0} completed job{serviceWorker.completedJobs === 1 ? "" : "s"}
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
                                <span>Booking</span>
                                <h3>{selectedService}</h3>
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
                                <label>Address</label>
                                <input
                                    className={addressTouched && !address.trim() ? "fieldError" : ""}
                                    placeholder="Enter your address"
                                    value={address}
                                    onBlur={() => setAddressTouched(true)}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {addressTouched && !address.trim() && (
                                    <div className="inlineError">Address is required.</div>
                                )}

                                <button
                                    type="button"
                                    className="mapToggle"
                                    onClick={() => setShowMap((prev) => !prev)}
                                >
                                    {showMap ? "Hide map location" : "Add map location"}
                                </button>

                                {showMap && <MapPicker setLocation={setLocationCoords} />}

                                {locationCoords && (
                                    <p className="locationPreview">
                                        📍 {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}
                                    </p>
                                )}

                                <label>Describe the work</label>
                                <textarea
                                    className="bookingTextarea"
                                    placeholder="Example: water is leaking under the sink, pipe looks broken..."
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                />

                                <label>Photo or video of the problem</label>
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
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {bookingStep === 2 && (
                            <div className="bookingStep">
                                <div className="stepTitleRow">
                                    <h4>Choose worker and time</h4>
                                    <span>{availableSlots.length} slots</span>
                                </div>

                                {availableSlots.length === 0 ? (
                                    <div className="serviceEmpty">
                                        <b>No available slots right now.</b>
                                        <span>Check again later or choose another service.</span>
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
                                                        <b>{slot.worker?.name || "Worker"}</b>
                                                        <small>⭐ {slot.worker?.rating || 0} ({slot.worker?.totalReviews || 0})</small>
                                                    </div>
                                                </div>

                                                <div className="slotMeta">
                                                    <span>📅 {new Date(slot.date).toLocaleDateString()}</span>
                                                    <span>⏰ {slot.startTime} - {slot.endTime}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="modalActions split">
                                    <button className="cancelBtn" type="button" onClick={() => setBookingStep(1)}>
                                        Back
                                    </button>
                                    <button className="confirmBtn" type="button" onClick={goToSummaryStep}>
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {bookingStep === 3 && (
                            <div className="bookingStep">
                                <label>Payment method</label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="vodafone_cash">Vodafone Cash</option>
                                    <option value="instapay">InstaPay</option>
                                    <option value="fawry">Fawry</option>
                                </select>

                                <label>Promo code</label>
                                <div className="promoCodeRow">
                                    <input
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="Example: FIX10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const discount = getPromoDiscount(promoCode);
                                            if (!discount) return toast.error("Invalid promo code.");
                                            localStorage.setItem("promo_code", promoCode.trim().toUpperCase());
                                            toast.success(`${discount}% promo applied.`);
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>

                                <div className="bookingSummary">
                                    <h4>Booking summary</h4>
                                    <div><span>Service</span><b>{selectedService}</b></div>
                                    <div><span>Worker</span><b>{selectedSlot?.worker?.name || "N/A"}</b></div>
                                    <div><span>Date</span><b>{selectedSlot ? new Date(selectedSlot.date).toLocaleDateString() : "N/A"}</b></div>
                                    <div><span>Time</span><b>{selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "N/A"}</b></div>
                                    <div><span>Address</span><b>{address.trim()}</b></div>
                                    <div><span>Media</span><b>{bookingFiles.length || "No"} file{bookingFiles.length === 1 ? "" : "s"}</b></div>
                                    <div><span>Payment</span><b>{paymentType.replace("_", " ")}</b></div>
                                    {promoCode && getPromoDiscount(promoCode) > 0 && (
                                        <div><span>Promo</span><b>{promoCode.trim().toUpperCase()} - {getPromoDiscount(promoCode)}% off</b></div>
                                    )}
                                    {estimatePreview && (
                                        <div>
                                            <span>Estimate</span>
                                            <b>
                                                {estimatePreview.min} - {estimatePreview.max} {estimatePreview.currency}
                                            </b>
                                        </div>
                                    )}
                                </div>

                                {estimatePreview && (
                                    <div className="priceEstimateBox">
                                        {estimatePreview.discount && (
                                            <span>
                                                Before promo: {estimatePreview.originalMin} - {estimatePreview.originalMax} {estimatePreview.currency}
                                            </span>
                                        )}
                                        <b>Estimated range: {estimatePreview.min} - {estimatePreview.max} {estimatePreview.currency}</b>
                                        <span>Severity: {estimatePreview.severity}</span>
                                        <p>The worker will send the final price after checking the job.</p>
                                    </div>
                                )}

                                <div className="modalActions split">
                                    <button className="cancelBtn" type="button" onClick={() => setBookingStep(2)}>
                                        Back
                                    </button>
                                    <button
                                        className="confirmBtn"
                                        onClick={handleConfirmBooking}
                                        disabled={loading}
                                    >
                                        {loading ? "Booking..." : "Confirm Booking"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <SiteFooter />
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
