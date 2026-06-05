import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Landing from "../pages/Landing";
import Profile from "../pages/Profile";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "../pages/auth/components/ProtectedRoute";
import RoleHome from "../pages/RoleHome";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/spectator"
        element={
          <ProtectedRoute allowedRoles={["Spectator"]}>
            <RoleHome allowedRole="Spectator" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jockey"
        element={
          <ProtectedRoute allowedRoles={["Jockey"]}>
            <RoleHome allowedRole="Jockey" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
