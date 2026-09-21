import { describe, expect, it } from "vitest";

import { formatActivityDate, isToday, startOfDay } from "@/lib/time";

describe("time (Asia/Karachi)", () => {
  it("starts the day at the previous UTC evening for a morning PKT instant", () => {
    // 2026-09-21 10:00 PKT == 2026-09-21 05:00 UTC
    const tenAmPkt = Date.UTC(2026, 8, 21, 5, 0, 0);
    // Karachi midnight for Sep 21 == 2026-09-20 19:00 UTC
    expect(startOfDay(tenAmPkt)).toBe(Date.UTC(2026, 8, 20, 19, 0, 0));
  });

  it("handles instants exactly at Karachi midnight", () => {
    const karachiMidnight = Date.UTC(2026, 8, 20, 19, 0, 0);
    expect(startOfDay(karachiMidnight)).toBe(karachiMidnight);
  });

  it("treats late-evening PKT as the same Karachi day", () => {
    // 2026-09-21 23:00 PKT == 2026-09-21 18:00 UTC
    const nightPkt = Date.UTC(2026, 8, 21, 18, 0, 0);
    expect(startOfDay(nightPkt)).toBe(Date.UTC(2026, 8, 20, 19, 0, 0));
  });

  it("flags today's midnight instant as today and yesterday's as not", () => {
    const today = startOfDay(Date.now());
    expect(isToday(today)).toBe(true);
    expect(isToday(today - 1)).toBe(false);
  });

  it("labels a fixed past date as a short date", () => {
    // 2026-09-21 09:00 PKT == 2026-09-21 04:00 UTC (past, not today)
    const ts = Date.UTC(2026, 8, 21, 4, 0, 0);
    if (!isToday(ts)) {
      expect(formatActivityDate(ts)).toBe("21 Sep");
    }
  });
});