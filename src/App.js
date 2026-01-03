import { Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
// import ApplicantLayout from "./layouts/ApplicantLayout";

// Auth
import AuthGate from "./auth/AuthGate";
import RoleGate from "./auth/RoleGate";

// Pages
import Jobs from "./pages/Jobs";
// import Apply from "./pages/Apply";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import JobsAdmin from "./pages/admin/Jobs";

// Admin pages
// import Applications from "./pages/admin/Applications";
// import JobsAdmin from "./pages/admin/Jobs";
// import Users from "./pages/admin/Users";

// Applicant pages
// import Dashboard from "./pages/applicant/Dashboard";
// import ApplicationDetail from "./pages/applicant/Application";

export default function App() {
  return (
    <Routes>
      {/* ------------------- Public Pages ------------------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Jobs />} />
        {/* <Route path="/apply/:jobId" element={<Apply />} /> */}
        <Route path="/login" element={<Login />} />
      </Route>

      {/* ------------------- Admin Pages ------------------- */}
      <Route
        path="/admin/*"
        element={
          <AuthGate>
            <RoleGate role="admin">
              <AdminLayout />
            </RoleGate>
          </AuthGate>
        }
      >
        {/* Nested admin routes */}
        <Route index element={<Dashboard />} /> {/* default page for /admin */}
        {/* <Route path="applications" element={<Applications />} /> */}
        <Route path="jobs" element={<JobsAdmin />} />
        {/* <Route path="users" element={<Users />} /> */}
      </Route>

      {/* ------------------- Applicant Pages ------------------- */}
      {/* <Route
        path="/applicant/*"
        element={
          <AuthGate>
            <RoleGate role="applicant">
              <ApplicantLayout />
            </RoleGate>
          </AuthGate>
        }
      > */}
        {/* Nested applicant routes */}
        {/* <Route path="" element={<Dashboard />} />
        <Route path="application/:id" element={<ApplicationDetail />} /> */}
      {/* </Route> */}
    </Routes>
  );
}
