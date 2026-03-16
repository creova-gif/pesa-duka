import { useState } from "react";
import { Bell, X, AlertTriangle, DollarSign, RefreshCw, FileText } from "lucide-react";

interface Notification {
  id: number;
  type: "warning" | "success" | "info" | "danger" | "brand";
  icon: string;
  tag: "low-stock" | "payment" | "reminder" | "sync" | "system";
  unread: boolean;
  title: string;
  desc: string;
  time: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1, type: "warning", icon: "📦", tag: "low-stock", unread: true,
    title: "Ndovu Cement 50kg — Low Stock",
    desc: "Only 5 bags remaining. Reorder threshold is 10.",
    time: "2 min ago",
  },
  {
    id: 2, type: "warning", icon: "🌾", tag: "low-stock", unread: true,
    title: "Nishati Rice 5kg — Low Stock",
    desc: "15 bags left. Last sold: today at 09:14.",
    time: "15 min ago",
  },
  {
    id: 3, type: "success", icon: "💸", tag: "payment", unread: true,
    title: "Payment Received — TSh 45,000",
    desc: "Fatuma Ally settled overdue balance via M-Pesa.",
    time: "1 hr ago",
  },
  {
    id: 4, type: "info", icon: "🔔", tag: "reminder", unread: false,
    title: "Credit Reminder Sent",
    desc: "Auto-reminder sent to 4 customers with balances due this week.",
    time: "3 hrs ago",
  },
  {
    id: 5, type: "brand", icon: "🔄", tag: "sync", unread: false,
    title: "Data Synced",
    desc: "89 transactions synced after coming back online. All up to date.",
    time: "5 hrs ago",
  },
  {
    id: 6, type: "info", icon: "📊", tag: "system", unread: false,
    title: "Weekly Report Ready",
    desc: "Your week ending March 14 report is available in Reports.",
    time: "Yesterday",
  },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "stock" | "payments" | "system">("all");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filtered = notifications.filter((n) => {
    if (tab === "all") return true;
    if (tab === "stock") return n.tag === "low-stock";
    if (tab === "payments") return n.tag === "payment" || n.tag === "reminder";
    if (tab === "system") return n.tag === "sync" || n.tag === "system";
    return true;
  });

  const dismiss = (id: number) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const markRead = (id: number) => setNotifications((prev) =>
    prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
  );
  const clearAll = () => setNotifications([]);
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const tabs = [
    { key: "all" as const, label: "All", count: notifications.length },
    { key: "stock" as const, label: "Stock", count: notifications.filter(n => n.tag === "low-stock").length },
    { key: "payments" as const, label: "Payments", count: notifications.filter(n => n.tag === "payment" || n.tag === "reminder").length },
    { key: "system" as const, label: "System", count: notifications.filter(n => n.tag === "sync" || n.tag === "system").length },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "warning": return "bg-amber-50 dark:bg-amber-900/10";
      case "success": return "bg-green-50 dark:bg-green-900/10";
      case "info": return "bg-blue-50 dark:bg-blue-900/10";
      case "danger": return "bg-red-50 dark:bg-red-900/10";
      case "brand": return "bg-primary/10";
      default: return "bg-muted";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white rounded-full text-[10px] font-extrabold flex items-center justify-center px-1 border-2 border-background animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+12px)] right-0 w-[380px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-extrabold text-sm">Notifications</h3>
              <div className="flex gap-2 items-center">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pt-3">
              {tabs.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    tab === key
                      ? "bg-primary text-white"
                      : "bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`ml-1 inline-flex items-center justify-center min-w-[16px] h-4 rounded text-[10px] px-1 ${
                      tab === key ? "bg-white/20" : "bg-muted text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="py-10 px-5 text-center text-muted-foreground">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="text-sm">All caught up!</div>
                  <div className="text-xs text-muted-foreground mt-1">No notifications here</div>
                </div>
              ) : (
                filtered.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex gap-3 px-5 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border last:border-0 relative ${
                      n.unread ? "bg-muted/20" : ""
                    }`}
                  >
                    {n.unread && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${getTypeColor(n.type)}`}>
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold mb-0.5 leading-tight ${n.unread ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </div>
                      <div className="text-xs text-muted-foreground leading-snug truncate">
                        {n.desc}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-muted-foreground/70">{n.time}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                          n.tag === "low-stock" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                          n.tag === "payment" ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                          n.tag === "reminder" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                          n.tag === "sync" ? "bg-primary/10 text-primary" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {n.tag === "low-stock" ? "Low Stock" :
                           n.tag === "payment" ? "Payment" :
                           n.tag === "reminder" ? "Reminder" :
                           n.tag === "sync" ? "Sync" : "System"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded transition-colors flex-shrink-0 self-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border text-center">
              <button className="text-sm font-semibold text-primary hover:underline">
                View notification settings →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
