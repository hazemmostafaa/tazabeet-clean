import { Navigate } from "react-router-dom";
import { isSessionValid } from "../utils/sessionSecurity";

export default function WorkerRoute({ children }) {
    if (!isSessionValid("worker")) return <Navigate to="/" replace />;

    return children;
}
