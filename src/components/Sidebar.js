import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Applications", to: "/admin/applications" },
  { label: "Jobs", to: "/admin/jobs" },
  { label: "Users", to: "/admin/users" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 text-lg font-semibold border-b border-slate-800">
        ATS Admin
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `
              flex items-center px-3 py-2 rounded-lg text-sm font-medium
              transition
              ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }
              `
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800">
        <button
          className="w-full text-left text-sm text-slate-400 hover:text-white"
          onClick={() => console.log("logout")}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
