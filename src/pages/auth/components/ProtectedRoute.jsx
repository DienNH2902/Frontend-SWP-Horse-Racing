import { Navigate } from "react-router-dom";
import { getAuthSession } from "../../../utils/storage";

export default function ProtectedRoute({ children, allowedRoles }) {
  const authSession = getAuthSession();
  const role = authSession?.user?.role;

  if (!authSession) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
