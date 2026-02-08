import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Tag, FileText, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onLogout: () => Promise<void> | void;
}

const navItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Cupons", path: "/admin/cupons", icon: Tag },
  { title: "Formulários", path: "/admin/formularios", icon: FileText },
];

const AdminLayout = ({ onLogout }: Props) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark-slate-blue transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:flex lg:flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link to="/admin">
            <img src="/images/logo-white.png" alt="GuardianTech" className="h-5" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-base-color text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 lg:px-8 h-16 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu size={22} />
          </button>
          <h2 className="font-alt font-semibold text-foreground text-lg">
            {navItems.find((n) => isActive(n.path))?.title || "Admin"}
          </h2>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
