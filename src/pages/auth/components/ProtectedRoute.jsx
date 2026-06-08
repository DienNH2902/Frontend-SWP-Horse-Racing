import { Navigate, Outlet } from "react-router-dom";
import { getAuthSession } from "../../../utils/storage";
import { normalizeRole } from "../../../utils/roles";

export default function ProtectedRoute({ allowedRoles = [] }) {
    const session = getAuthSession();

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0) {
        const userRole = normalizeRole(session?.user?.role);
        const allowed = allowedRoles.map(normalizeRole);

        if (!allowed.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
}