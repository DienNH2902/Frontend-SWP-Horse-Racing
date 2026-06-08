import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getProfile } from "../../../api/services/auth.service";
import { normalizeRole } from "../../../utils/roles";
import { clearAuthSession, getAuthSession } from "../../../utils/storage";

export default function ProtectedRoute({ allowedRoles = [] }) {
    const [authState, setAuthState] = useState({
        isLoading: true,
        isAuthenticated: false,
        role: null,
    });

    useEffect(() => {
        let isMounted = true;
        const session = getAuthSession();

        if (!session) {
            setAuthState({
                isLoading: false,
                isAuthenticated: false,
                role: null,
            });
            return undefined;
        }

        getProfile()
            .then((profile) => {
                if (isMounted) {
                    setAuthState({
                        isLoading: false,
                        isAuthenticated: true,
                        role: profile?.role,
                    });
                }
            })
            .catch(() => {
                clearAuthSession();

                if (isMounted) {
                    setAuthState({
                        isLoading: false,
                        isAuthenticated: false,
                        role: null,
                    });
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (authState.isLoading) {
        return null;
    }

    if (!authState.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0) {
        const userRole = normalizeRole(authState.role);
        const allowed = allowedRoles.map(normalizeRole);

        if (!allowed.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
}
