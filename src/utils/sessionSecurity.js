const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.clear();
}

export function isSessionValid(requiredRole) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const lastActivity = Number(localStorage.getItem("last_activity") || 0);
    const decoded = token ? decodeToken(token) : null;
    const now = Date.now();

    if (!token || !decoded || (requiredRole && role !== requiredRole)) {
        clearSession();
        return false;
    }

    if (decoded.exp && decoded.exp * 1000 <= now) {
        clearSession();
        return false;
    }

    if (lastActivity && now - lastActivity > IDLE_TIMEOUT_MS) {
        clearSession();
        return false;
    }

    localStorage.setItem("last_activity", String(now));
    return true;
}

export function bindSessionActivity() {
    const updateActivity = () => {
        if (localStorage.getItem("token")) {
            localStorage.setItem("last_activity", String(Date.now()));
        }
    };

    ["click", "keydown", "scroll", "touchstart"].forEach((event) => {
        window.addEventListener(event, updateActivity, { passive: true });
    });

    updateActivity();

    return () => {
        ["click", "keydown", "scroll", "touchstart"].forEach((event) => {
            window.removeEventListener(event, updateActivity);
        });
    };
}
