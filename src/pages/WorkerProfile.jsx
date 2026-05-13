import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./LandingPage.css";
import logo from "../assets/logo.png";
export default function WorkerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNav, setShowNav] = useState(true);
    const [worker, setWorker] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [favorited, setFavorited] = useState(false);

    useEffect(() => {
        fetch(`https://tazabeet-backend.vibenest.net/api/auth/worker/${id}`)
            .then(res => res.json())
            .then(data => {
                setWorker(data.worker);
                setReviews(data.reviews || []);
            })
            .catch(err => console.log(err));
    }, [id]);

    async function toggleFavorite() {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "customer") {
            navigate("/login", { state: { tab: "login", needLogin: true } });
            return;
        }

        try {
            const res = await fetch(`https://tazabeet-backend.vibenest.net/api/customer/favorites/${id}`, {
                method: "PUT",
                headers: { Authorization: "Bearer " + token },
            });
            const data = await res.json();
            if (!res.ok) return toast.error(data.message || "Failed to update favorite");
            setFavorited(data.favorited);
            toast.success(data.message);
        } catch (err) {
            console.log(err);
            toast.error("Error updating favorite");
        }
    }

    if (!worker) return <div>Loading...</div>;

    return (
        <div className="lp">


            <div className="lpTopLanding">
                <button className="lpBrand" onClick={() => navigate("/")}>
                    <img src={logo} alt="logo" className="lpLogo" />
                    <span className="lpBrandName">TAZABEET</span>
                </button>

                <div className="lpBtn ghost">
                    <button onClick={() => navigate(-1)}>⬅ Back</button>
                </div>
            </div>


            <div className="lpBody" style={{ maxWidth: 900, margin: "auto" }}>


                <div className="serviceCard">

                    <div className="serviceContent">

                        <div className="workerProfileHero">
                            <div className="workerProfilePhoto large">
                                {worker.profilePhoto ? (
                                    <img src={worker.profilePhoto} alt={worker.name} />
                                ) : (
                                    <span>{worker.name?.charAt(0)}</span>
                                )}
                            </div>

                            <div>
                                <div className="workerName">{worker.name}</div>
                                <div className="workerJob">Expert</div>
                                <div className={`verifiedBadge ${worker.verificationStatus === "verified" ? "ok" : ""}`}>
                                    {worker.verificationStatus === "verified" ? "Verified worker" : "Not verified yet"}
                                </div>
                                <div className="rating">
                                    ⭐ {worker.rating || 0} ({worker.totalReviews || 0} reviews)
                                </div>
                                <button className="favoriteBtn" type="button" onClick={toggleFavorite}>
                                    {favorited ? "Saved" : "Save worker"}
                                </button>
                            </div>
                        </div>

                        <div className="publicWorkerSection">
                            <h3>Experience</h3>
                            {worker.experience ? (
                                <p>{worker.experience}</p>
                            ) : (
                                <p>No experience added yet.</p>
                            )}
                        </div>


                        <div className="publicWorkerSection">
                            <h3>Previous Work</h3>

                            {worker.portfolio?.length > 0 ? (
                                <div className="publicPortfolioGrid">
                                    {worker.portfolio.map((item, i) => (
                                        <div className="publicPortfolioCard" key={item.id || item._id || i}>
                                            <h4>{item.title}</h4>
                                            {item.desc && <p>{item.desc}</p>}

                                            {(item.media || []).length > 0 ? (
                                                <div className="publicPortfolioMedia">
                                                    {(item.media || []).map((media, mediaIndex) => {
                                                        const mediaUrl = typeof media === "string" ? media : media.url;
                                                        const mediaType = typeof media === "string" ? "" : media.type;

                                                        return mediaType?.startsWith("video") ? (
                                                            <video key={mediaIndex} src={mediaUrl} controls />
                                                        ) : (
                                                            <img key={mediaIndex} src={mediaUrl} alt={item.title || "Previous work"} />
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p>No media saved for this portfolio item.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No previous work added yet.</p>
                            )}
                        </div>


                        <div className="publicWorkerSection">
                            <h3>Reviews</h3>

                            {reviews.length > 0 ? (
                                reviews.map((r) => (
                                    <div key={r._id} style={{
                                        background: "#f4f4f4",
                                        padding: 10,
                                        borderRadius: 10,
                                        marginBottom: 10
                                    }}>
                                        ⭐ {r.rating}
                                        <div>"{r.review}"</div>
                                        <small>- {r.customer?.name}</small>
                                    </div>
                                ))
                            ) : (
                                <p>No reviews yet</p>
                            )}
                        </div>

                    </div>
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
