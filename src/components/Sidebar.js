import { NavLink,useNavigate } from "react-router-dom";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const navItems = [
  { label: "Applications", to: "/admin/applications" },
  { label: "Jobs", to: "/admin/jobs" },
  { label: "Users", to: "/admin/users" },
];

export default function Sidebar() {
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
<aside className="w-52 min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 text-lg font-semibold border-b border-slate-800">
        ATS Admin
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto" >
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
        <div className="px-4 py-2 mt-2 border-t border-slate-800">
          <button
            className="w-full text-left text-sm text-slate-400 hover:text-white"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </nav>
    </aside>
  );
}
