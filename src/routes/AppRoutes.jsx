import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import RoleLayout from "../layouts/RoleLayout";
import Home from "../pages/Home";
import JockeyProfile from "../pages/JockeyProfile";
import Landing from "../pages/Landing";
import Profile from "../pages/Profile";
import UserManagement from "../pages/admin/UserManagement";
import TournamentManagement from "../pages/admin/TournamentManagement";
import RegistrationManagement from "../pages/admin/RegistrationManagement";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "../pages/auth/components/ProtectedRoute";
import JockeyDashboard from "../pages/jockey/JockeyDashboard";
import JockeyInvitations from "../pages/jockey/JockeyInvitations";
import JockeyRaceSchedule from "../pages/jockey/JockeyRaceSchedule";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerHorseRegister from "../pages/owner/OwnerHorseRegister";
import OwnerHorses from "../pages/owner/OwnerHorses";
import OwnerJockeyRaceWorkspace from "../pages/owner/OwnerJockeyRaceWorkspace";
import OwnerRaceResults from "../pages/owner/OwnerRaceResults";
import OwnerTournaments from "../pages/owner/OwnerTournaments";
import RefereeDashboard from "../pages/referee/RefereeDashboard";
import RefereeRaceDetail from "../pages/referee/RefereeRaceDetail";
import RefereeTournamentDetail from "../pages/referee/RefereeTournamentDetail";
import RefereeHorseDetail from "../pages/referee/RefereeHorseDetail";
import RefereeJockeyDetail from "../pages/referee/RefereeJockeyDetail";
import RefereeOwnerDetail from "../pages/referee/RefereeOwnerDetail";
import RoleHome from "../pages/RoleHome";
import OAuthSuccess from "../pages/auth/OAuthSuccess";
import ForgotPassword from "../pages/auth/ForgotPassword";
import JockeyLicenseManagement from "../pages/admin/JockeyLicenseManagement";

const OWNER_NAV = [
  { key: "owner-dashboard", to: "/owner", label: "Dashboard" },
  { key: "owner-horses", to: "/owner/horses", label: "My horses" },
  {
    key: "owner-register-horse",
    to: "/owner/horses/register",
    label: "Register horse",
  },
  {
    key: "owner-jockey-races",
    to: "/owner/jockey-races",
    label: "Jockey & entries",
  },
  { key: "owner-tournaments", to: "/owner/tournaments", label: "Tournaments" },
  { key: "owner-results", to: "/owner/race-results", label: "Race results" },
];

const REFEREE_NAV = [
  { key: "referee-dashboard", to: "/referee", label: "Tournaments" },
];

const JOCKEY_NAV = [
  { key: "jockey-dashboard", to: "/jockey", label: "Dashboard" },
  {
    key: "jockey-invitations",
    to: "/jockey/invitations",
    label: "Invitations",
  },
  { key: "jockey-schedule", to: "/jockey/schedule", label: "My race schedule" },
];

function AdminUsersPage() {
  return (
    <AdminLayout>
      <UserManagement />
      <JockeyLicenseManagement />
    </AdminLayout>
  );
}

function AdminTournamentsPage() {
  return (
    <AdminLayout>
      <TournamentManagement />
    </AdminLayout>
  );
}

function AdminRegistrationsPage() {
  return (
    <AdminLayout>
      <RegistrationManagement />
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/jockey-license"
          element={
            <AdminLayout>
              <JockeyLicenseManagement />
            </AdminLayout>
          }
        />
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
          <Route
            path="owner/horses/register"
            element={<OwnerHorseRegister />}
          />
          <Route
            path="owner/jockey-races"
            element={<OwnerJockeyRaceWorkspace />}
          />
          <Route path="owner/tournaments" element={<OwnerTournaments />} />
          <Route path="owner/race-results" element={<OwnerRaceResults />} />
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

          <Route
            path="referee/tournaments/:id"
            element={<RefereeTournamentDetail />}
          />

          <Route
            path="referee/races/:id"
            element={<RefereeRaceDetail />}
          />

          <Route
            path="referee/horses/:id"
            element={<RefereeHorseDetail />}
          />

          <Route
            path="referee/jockeys/:id"
            element={<RefereeJockeyDetail />}
          />

          <Route
            path="referee/owners/:id"
            element={<RefereeOwnerDetail />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Spectator"]} />}>
        <Route
          path="/spectator"
          element={<RoleHome allowedRole="Spectator" />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["Jockey"]} />}>
        <Route
          element={
            <RoleLayout
              role="Jockey"
              title="Jockey workspace"
              subtitle="Manage invitations, assignments, and race performance"
              navItems={JOCKEY_NAV}
            />
          }
        >
          <Route path="/jockey" element={<JockeyDashboard />} />
          <Route path="/jockey/invitations" element={<JockeyInvitations />} />
          <Route path="/jockey/schedule" element={<JockeyRaceSchedule />} />
        </Route>

        <Route path="/jockey/profile" element={<JockeyProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
