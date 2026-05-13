import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://tazabeet.netlify.app";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

const SEO_PAGES = {
    "/": {
        title: "TAZABEET | Home Services in Alexandria",
        description:
            "Book trusted home services in Alexandria with TAZABEET. Find plumbing, electrical, cleaning, painting, carpentry, AC repair, pest control, tiling, and appliance services.",
    },
    "/services": {
        title: "Home Services in Alexandria | TAZABEET Services",
        description:
            "Browse TAZABEET services in Alexandria, including plumbing, electrical, cleaning, painting, carpentry, AC repair, pest control, carpets, alumetal, tiling, gypsum boards, and appliances.",
    },
    "/contact": {
        title: "Contact TAZABEET | Home Services Support in Alexandria",
        description:
            "Contact TAZABEET for home service support, booking questions, and customer help in Alexandria.",
    },
};

function setMeta(selector, attributes) {
    let element = document.head.querySelector(selector);

    if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
    }

    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
}

function setCanonical(url) {
    let element = document.head.querySelector('link[rel="canonical"]');

    if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "canonical");
        document.head.appendChild(element);
    }

    element.setAttribute("href", url);
}

export default function SeoManager() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "");
        const page = SEO_PAGES[path];
        const title = page?.title || "TAZABEET";
        const description =
            page?.description ||
            "TAZABEET is a home services platform for customers and workers in Alexandria.";
        const canonicalUrl = page ? `${SITE_URL}${path === "/" ? "" : path}` : SITE_URL;
        const robots = page ? "index,follow" : "noindex,nofollow";

        document.title = title;
        setCanonical(canonicalUrl);
        setMeta('meta[name="description"]', { name: "description", content: description });
        setMeta('meta[name="robots"]', { name: "robots", content: robots });
        setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
        setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "TAZABEET" });
        setMeta('meta[property="og:title"]', { property: "og:title", content: title });
        setMeta('meta[property="og:description"]', {
            property: "og:description",
            content: description,
        });
        setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
        setMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_IMAGE });
        setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
        setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
        setMeta('meta[name="twitter:description"]', {
            name: "twitter:description",
            content: description,
        });
        setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: DEFAULT_IMAGE });
    }, [location.pathname]);

    return null;
}
