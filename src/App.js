import { Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
// import ApplicantLayout from "./layouts/ApplicantLayout";

// Auth
import AuthGate from "./auth/AuthGate";
import RoleGate from "./auth/RoleGate";

// Public Pages
import Jobs from "./pages/Jobs";
import Apply from "./pages/Apply";
import Login from "./pages/Login";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import JobsAdmin from "./pages/admin/Jobs";
import AdminJobCreate from "./pages/admin/JobCreate";
import AdminJobEdit from "./pages/admin/JobEdit";
import AdminJobView from "./pages/admin/JobView";
import Applications from "./pages/admin/Applications";
import ApplicationView from "./pages/admin/ApplicationView";
import Users from "./pages/admin/Users";

export default function App() {
  return (
      <Routes>
        {/* ------------------- Public Pages ------------------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Jobs />} />
          <Route path="/apply/:jobId" element={<Apply />} />
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
          <Route path="applications" element={<Applications />} />
          <Route path="jobs" element={<JobsAdmin />} />
          <Route path="applications/:applicationId" element={<ApplicationView />} />
          <Route path="users" element={<Users />} />
          <Route path="jobs/create" element={<AdminJobCreate />} />
          <Route path="jobs/edit/:jobId" element={<AdminJobEdit />} />
          <Route path="jobs/:jobId" element={<AdminJobView />} />

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
