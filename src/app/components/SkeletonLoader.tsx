interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

export function Skeleton({ width = "100%", height = "14px", radius = "6px", className = "" }: SkeletonProps) {
  return (
    <span
      className={`pd-skeleton ${className}`}
      style={{ display: "block", width, height, borderRadius: radius }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 pd-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Skeleton width="160px" height="28px" radius="8px" />
        <div className="flex gap-3">
          <Skeleton width="140px" height="34px" radius="10px" />
          <Skeleton width="80px" height="34px" radius="10px" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 md:p-6 border border-border"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <Skeleton width="70px" height="11px" />
              <Skeleton width="40px" height="40px" radius="10px" />
            </div>
            <Skeleton width="110px" height="26px" radius="6px" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 md:p-6 border border-border">
            <Skeleton width="100px" height="18px" className="mb-4" />
            <Skeleton width="100%" height="220px" radius="10px" />
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-4 md:p-6 border border-border mb-6">
        <Skeleton width="140px" height="18px" className="mb-4" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
            <Skeleton width="40px" height="40px" radius="10px" />
            <div className="flex-1">
              <Skeleton width="60%" height="13px" className="mb-2" />
              <Skeleton width="40%" height="11px" />
            </div>
            <Skeleton width="90px" height="13px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <tbody>
      {Array(rows).fill(0).map((_, i) => (
        <tr key={i} style={{ animationDelay: `${i * 40}ms` }}>
          <td className="p-3 md:p-4">
            <div>
              <Skeleton width="120px" height="14px" className="mb-1.5" />
              <Skeleton width="70px" height="11px" />
            </div>
          </td>
          <td className="p-3 md:p-4"><Skeleton width="70px" height="22px" radius="20px" /></td>
          <td className="p-3 md:p-4"><Skeleton width="80px" height="14px" /></td>
          <td className="p-3 md:p-4 hidden md:table-cell"><Skeleton width="80px" height="14px" /></td>
          <td className="p-3 md:p-4"><Skeleton width="60px" height="14px" /></td>
          <td className="p-3 md:p-4 hidden lg:table-cell"><Skeleton width="28px" height="28px" radius="6px" /></td>
        </tr>
      ))}
    </tbody>
  );
}

export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 pd-fade-in">
      {Array(rows).fill(0).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl p-4 md:p-6 border border-border"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton width="55%" height="16px" className="mb-2" />
              <Skeleton width="40%" height="12px" className="mb-1" />
              <Skeleton width="30%" height="12px" />
            </div>
            <Skeleton width="80px" height="48px" radius="10px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 pd-fade-in">
      {Array(rows).fill(0).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 md:gap-4 p-3 md:p-4"
          style={{ animationDelay: `${i * 45}ms` }}
        >
          <Skeleton width="40px" height="40px" radius="10px" />
          <div className="flex-1">
            <Skeleton width="60%" height="13px" className="mb-1.5" />
            <Skeleton width="35%" height="11px" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton width="55px" height="20px" radius="6px" />
            <Skeleton width="75px" height="13px" />
          </div>
        </div>
      ))}
    </div>
  );
}
