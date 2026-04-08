import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  change?: number;
  changeLabel?: string;
  delay?: number;
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-blue-100 dark:bg-blue-900/30",
  iconColor = "text-blue-600 dark:text-blue-400",
  change,
  changeLabel = "vs yesterday",
  delay = 0,
  accentColor,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className="bg-card rounded-xl p-4 md:p-6 border border-border pd-stat-card pd-fade-up"
      style={{
        animationDelay: `${delay}ms`,
        borderLeft: accentColor ? `3px solid ${accentColor}` : undefined,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs md:text-sm text-muted-foreground mb-1.5 font-medium truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold pd-number truncate">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
              )}
              <span className={`text-xs font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-muted-foreground truncate">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
