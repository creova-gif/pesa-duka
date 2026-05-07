import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, ShoppingCart, Package, Book, Users, Truck, BarChart3, Moon, Sun, Menu, X, Settings as SettingsIcon, Briefcase, UserCog, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { NotificationCenter } from "./NotificationCenter";
import { OfflineStatusPill, type ConnectionStatus } from "./OfflineStatus";
import { getProfile } from "../hooks/useBusinessProfile";

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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() =>
    navigator.onLine ? "online" : "offline"
  );
  const profile = getProfile();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleOnline = () => setConnectionStatus("online");
    const handleOffline = () => setConnectionStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const initials = profile?.ownerName
    ? profile.ownerName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PD";

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card/95 backdrop-blur-md border-b border-border flex items-center px-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-primary transition-colors pd-btn-ghost p-1 rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <Link to="/" className="flex items-center gap-2 ml-3">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <span className="font-black text-base tracking-tight">PESA <span style={{ color: "#E56B0A" }}>DUKA</span></span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <OfflineStatusPill status={connectionStatus} queuedCount={0} />
          <NotificationCenter />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-[224px] bg-card border-r border-border flex flex-col
          transform transition-all duration-250 ease-in-out
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="hidden lg:flex h-16 items-center px-5 border-b border-border pd-brand-gradient">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-black text-base">P</span>
            </div>
            <div>
              <div className="font-black text-base tracking-tight leading-none">
                PESA <span style={{ color: "#E56B0A" }}>DUKA</span>
              </div>
              <div className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">Biashara Bora</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 mt-14 lg:mt-0 overflow-y-auto">
          <div className="px-2 mb-2">
            <p className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">Main Menu</p>
          </div>
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`pd-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium ${
                  active
                    ? "pd-nav-active bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-primary" : ""}`} style={{ width: "18px", height: "18px" }} />
                <span>{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          <div className="px-2 mt-4 mb-2">
            <p className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">More</p>
          </div>
          {navItems.slice(6).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`pd-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium ${
                  active
                    ? "pd-nav-active bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon style={{ width: "18px", height: "18px", flexShrink: 0 }} className={active ? "text-primary" : ""} />
                <span>{item.label}</span>
                {item.path === "/tools" && !active && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 bg-primary/15 text-primary rounded-full">AI</span>
                )}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-1">
          {/* Upgrade badge */}
          <Link
            to="/#pricing"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white pd-upgrade-badge transition-opacity hover:opacity-90"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Upgrade to Growth</span>
            <span className="ml-auto opacity-70 text-[10px]">TSh 250/day</span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="pd-nav-link flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors text-sm font-medium"
          >
            {mounted && theme === "dark" ? (
              <><Sun style={{ width: "16px", height: "16px" }} /><span>Light mode</span></>
            ) : (
              <><Moon style={{ width: "16px", height: "16px" }} /><span>Dark mode</span></>
            )}
          </button>

          {/* User avatar */}
          {profile && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/50 mt-1">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{profile.businessName || profile.ownerName}</div>
                <div className="text-[10px] text-muted-foreground truncate">{profile.region || "Tanzania"}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 pd-modal-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex h-14 items-center justify-end px-8 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30 gap-3">
          <OfflineStatusPill status={connectionStatus} queuedCount={0} />
          <NotificationCenter />
        </div>
        <div className="pd-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
