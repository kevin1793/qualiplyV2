// src/layouts/PublicLayout.jsx
import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-slate-900 text-white">
            Qualiply ATS
          </Link>
          <nav className="space-x-4">
            <Link
              to="/"
              className="text-slate-700 hover:text-grey font-medium text-white"
            >
              Jobs
            </Link>
            <Link
              to="/login"
              className="text-slate-700 hover:text-grey font-medium text-white"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 shadow-inner py-4 text-center text-slate-500 text-sm text-white">
        &copy; {new Date().getFullYear()} Qualiply ATS. All rights reserved.
      </footer>
    </div>
  );
}
