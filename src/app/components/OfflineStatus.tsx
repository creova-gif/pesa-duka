import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";

export type ConnectionStatus = "online" | "offline" | "syncing";

interface OfflineStatusProps {
  status: ConnectionStatus;
  queuedCount?: number;
}

export function OfflineStatusPill({ status, queuedCount = 0 }: OfflineStatusProps) {
  const statusConfig = {
    online: {
      label: "Connected",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
      dotColor: "bg-green-600 dark:bg-green-400",
    },
    offline: {
      label: "Working Offline",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
      dotColor: "bg-red-600 dark:bg-red-400",
    },
    syncing: {
      label: "Syncing...",
      bgColor: "bg-primary/10",
      textColor: "text-primary",
      borderColor: "border-primary/25",
      dotColor: "bg-primary",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${config.bgColor} ${config.textColor} ${config.borderColor} ${status === "offline" ? "animate-pulse" : ""}`}>
      <div className={`w-2 h-2 rounded-full ${config.dotColor} ${status === "syncing" ? "animate-pulse" : ""}`} />
      {config.label}
      {status === "offline" && queuedCount > 0 && (
        <span className="ml-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
          {queuedCount}
        </span>
      )}
    </div>
  );
}

export function OfflineBanner({ queuedCount = 0 }: { queuedCount?: number }) {
  return (
    <div className="w-full bg-gradient-to-br from-red-50 to-red-50/30 dark:from-red-900/10 dark:to-red-900/5 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-red-600 dark:text-red-400">You're Working Offline</div>
          <div className="text-xs text-muted-foreground">
            Sales and changes are saved locally. They'll sync when you reconnect.
          </div>
        </div>
      </div>
      {queuedCount > 0 && (
        <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-3 py-1.5 text-xs font-bold flex-shrink-0">
          ⏳ {queuedCount} queued
        </div>
      )}
    </div>
  );
}

interface SyncBannerProps {
  synced: number;
  total: number;
  progress: number;
}

export function SyncBanner({ synced, total, progress }: SyncBannerProps) {
  return (
    <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
      <div className="text-xl animate-spin">
        <RefreshCw className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="text-sm font-semibold text-primary whitespace-nowrap">
        {synced}/{total} synced
      </div>
    </div>
  );
}

export function OnlineBanner({ syncedCount }: { syncedCount: number }) {
  return (
    <div className="w-full bg-gradient-to-br from-green-50 to-green-50/30 dark:from-green-900/10 dark:to-green-900/5 border border-green-200 dark:border-green-800/50 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
      <div>
        <div className="text-sm font-bold text-green-600 dark:text-green-400">Back Online — All Synced</div>
        <div className="text-xs text-muted-foreground">
          {syncedCount} transactions successfully synced to the cloud.
        </div>
      </div>
    </div>
  );
}

interface QueuedTransaction {
  id: number;
  type: "sale" | "expense" | "stock";
  icon: string;
  title: string;
  desc: string;
  amount?: string;
  time: string;
}

const SAMPLE_QUEUE: QueuedTransaction[] = [
  { id: 1, type: "sale", icon: "🛒", title: "Sale — TSh 8,500", desc: "3 items · Cash payment", amount: "+8,500", time: "11:32 AM" },
  { id: 2, type: "sale", icon: "🛒", title: "Sale — TSh 3,200", desc: "1 item · M-Pesa · Receipt pending", amount: "+3,200", time: "11:45 AM" },
  { id: 3, type: "expense", icon: "📤", title: "Expense — TSh 15,000", desc: "Utilities · Monthly electricity", amount: "−15,000", time: "12:10 PM" },
  { id: 4, type: "stock", icon: "📦", title: "Stock Received", desc: "Unga x20, Mafuta x10 from Supplier", amount: "", time: "12:22 PM" },
  { id: 5, type: "sale", icon: "🛒", title: "Sale — TSh 22,000", desc: "5 items · Airtel Money · Credit", amount: "+22,000", time: "12:55 PM" },
];

interface QueuePanelProps {
  queue?: QueuedTransaction[];
  onRetrySync?: () => void;
  syncing?: boolean;
}

export function QueuedTransactionsPanel({ queue = SAMPLE_QUEUE, onRetrySync, syncing = false }: QueuePanelProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "sale": return "bg-green-50 dark:bg-green-900/10";
      case "expense": return "bg-red-50 dark:bg-red-900/10";
      case "stock": return "bg-blue-50 dark:bg-blue-900/10";
      default: return "bg-muted";
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-sm font-extrabold">Pending Sync</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Saved locally · will sync automatically on reconnection
          </div>
        </div>
        {queue.length > 0 && (
          <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-full px-2.5 py-1 text-xs font-bold">
            {queue.length} pending
          </span>
        )}
      </div>

      <div className="max-h-[280px] overflow-y-auto">
        {queue.length === 0 ? (
          <div className="py-8 px-5 text-center text-muted-foreground">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-sm">All transactions synced</div>
          </div>
        ) : (
          queue.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${getTypeColor(item.type)}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{item.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{item.desc}</div>
              </div>
              <div className="text-right flex-shrink-0">
                {item.amount && (
                  <div className={`text-sm font-extrabold ${item.amount.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    TSh {item.amount}
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground/70">{item.time}</div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-red-400 dark:border-red-600 flex-shrink-0" />
            </div>
          ))
        )}
      </div>

      <div className="p-5 border-t border-border flex items-center justify-between gap-3">
        <div className="text-[11px] text-muted-foreground/70">
          {queue.length > 0
            ? `${queue.length} transaction${queue.length > 1 ? "s" : ""} waiting to sync`
            : "Queue is clear"}
        </div>
        <button
          onClick={onRetrySync}
          disabled={syncing || queue.length === 0}
          className="bg-primary hover:bg-primary/90 text-white border-none rounded-lg px-4 py-2 text-sm font-bold cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" /> Retry Sync
            </>
          )}
        </button>
      </div>
    </div>
  );
}
