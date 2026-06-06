import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "../pages/auth/components/ProtectedRoute";
import RoleLayout from "../layouts/RoleLayout";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerHorses from "../pages/owner/OwnerHorses";
import OwnerHorseDetail from "../pages/owner/OwnerHorseDetail";
import RefereeDashboard from "../pages/referee/RefereeDashboard";
import RefereeRaces from "../pages/referee/RefereeRaces";
import RefereeRaceDetail from "../pages/referee/RefereeRaceDetail";

const OWNER_NAV = [
  { key: "owner-dashboard", to: "/owner", label: "Dashboard" },
  { key: "owner-horses", to: "/owner/horses", label: "My horses" },
];

const REFEREE_NAV = [
  { key: "referee-dashboard", to: "/referee", label: "Dashboard" },
  { key: "referee-races", to: "/referee/races", label: "Races" },
];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowedRoles={["Horse Owner"]} />}>
        <Route
          element={
            <RoleLayout
              role="Horse Owner"
              title="Owner workspace"
              subtitle="Manage your stable and horses"
              navItems={OWNER_NAV}
            />
          }
        >
          <Route path="owner" element={<OwnerDashboard />} />
          <Route path="owner/horses" element={<OwnerHorses />} />
          <Route path="owner/horses/:id" element={<OwnerHorseDetail />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Referee"]} />}>
        <Route
          element={
            <RoleLayout
              role="Referee"
              title="Referee workspace"
              subtitle="Review races and manage results"
              navItems={REFEREE_NAV}
            />
          }
        >
          <Route path="referee" element={<RefereeDashboard />} />
          <Route path="referee/races" element={<RefereeRaces />} />
          <Route path="referee/races/:id" element={<RefereeRaceDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}