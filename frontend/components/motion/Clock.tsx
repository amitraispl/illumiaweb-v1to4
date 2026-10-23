"use client";

import { useEffect, useState } from "react";
import { timeIn } from "./effects";

/** Live local time for a timezone. Renders a placeholder on the server. */
export function Clock({ tz, seconds = false }: { tz: string; seconds?: boolean }) {
  const [now, setNow] = useState<string>("--:--");
  useEffect(() => {
    const tick = () => setNow(timeIn(tz, seconds));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tz, seconds]);
  return (
    <time suppressHydrationWarning className="clock">
      {now}
    </time>
  );
}
