import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, ShoppingCart, Package, Book, Users, Truck, BarChart3, Moon, Sun, Menu, X, Settings as SettingsIcon, Briefcase, UserCog } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { NotificationCenter } from "./NotificationCenter";
import { OfflineStatusPill, type ConnectionStatus } from "./OfflineStatus";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/pos", icon: ShoppingCart, label: "POS" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/cashbook", icon: Book, label: "Cashbook" },
  { path: "/customers", icon: Users, label: "Customers" },
  { path: "/team", icon: UserCog, label: "Team" },
  { path: "/suppliers", icon: Truck, label: "Suppliers" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
  { path: "/tools", icon: Briefcase, label: "Business Tools" },
  { path: "/settings", icon: SettingsIcon, label: "Settings" },
];

export function Layout() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("online");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center px-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-foreground hover:text-primary"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="font-bold text-lg">DUKA</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <OfflineStatusPill status={connectionStatus} queuedCount={0} />
          <NotificationCenter />
        </div>
      </div>

      {/* Sidebar - Desktop always visible, Mobile overlay */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-[240px] bg-card border-r border-border flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo - Desktop only */}
        <div className="hidden lg:flex h-16 items-center px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-lg">CREOVA SME</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 mt-14 lg:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle & Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors"
          >
            {mounted && theme === "dark" ? (
              <>
                <Sun className="w-5 h-5" />
                <span className="text-sm font-medium">Light mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span className="text-sm font-medium">Dark mode</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        {/* Desktop Header Bar */}
        <div className="hidden lg:flex h-16 items-center justify-end px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 gap-3">
          <OfflineStatusPill status={connectionStatus} queuedCount={0} />
          <NotificationCenter />
        </div>
        <Outlet />
      </main>
    </div>
  );
}