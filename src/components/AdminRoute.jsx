import { Navigate, useLocation } from "react-router-dom";
import { isSessionValid } from "../utils/sessionSecurity";

export default function AdminRoute({ children }) {
    const location = useLocation();

    if (!isSessionValid("admin")) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ tab: "login", needLogin: true, from: location.pathname }}
            />
        );
    }

    return children;
}
