import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(
  target: number,
  duration = 900,
  delay = 0
): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }

    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp + delay;
      const elapsed = timestamp - startTime;

      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      setValue(Math.round(easedProgress * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

export function formatTSh(value: number): string {
  if (value >= 1_000_000) {
    return `TSh ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `TSh ${value.toLocaleString()}`;
  }
  return `TSh ${value}`;
}
