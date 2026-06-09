import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import RoleLayout from "../layouts/RoleLayout";
import Home from "../pages/Home";
import JockeyProfile from "../pages/JockeyProfile";
import Landing from "../pages/Landing";
import Profile from "../pages/Profile";
import UserManagement from "../pages/admin/UserManagement";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "../pages/auth/components/ProtectedRoute";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerHorseDetail from "../pages/owner/OwnerHorseDetail";
import OwnerHorses from "../pages/owner/OwnerHorses";
import RefereeDashboard from "../pages/referee/RefereeDashboard";
import RefereeRaceDetail from "../pages/referee/RefereeRaceDetail";
import RefereeRaces from "../pages/referee/RefereeRaces";
import RoleHome from "../pages/RoleHome";
import OAuthSuccess from "../pages/auth/OAuthSuccess";

const OWNER_NAV = [
  { key: "owner-dashboard", to: "/owner", label: "Dashboard" },
  { key: "owner-horses", to: "/owner/horses", label: "My horses" },
];

const REFEREE_NAV = [
  { key: "referee-dashboard", to: "/referee", label: "Dashboard" },
  { key: "referee-races", to: "/referee/races", label: "Races" },
];

function AdminUsersPage() {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/oauth-success" element={<OAuthSuccess />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin" element={<AdminUsersPage />} />
        <Route path="/admin/dashboard" element={<AdminUsersPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

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

      <Route element={<ProtectedRoute allowedRoles={["Spectator"]} />}>
        <Route
          path="/spectator"
          element={<RoleHome allowedRole="Spectator" />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Jockey"]} />}>
        <Route path="/jockey" element={<RoleHome allowedRole="Jockey" />} />
        <Route path="/jockey/profile" element={<JockeyProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
