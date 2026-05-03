import { useEffect, useMemo, useState } from "react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { getOpenF1Laps } from "@/lib/api/openf1";

function formatLapTime(seconds) {
  if (!Number.isFinite(seconds)) return "-";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds - minutes * 60;
  return `${minutes}:${remaining.toFixed(3).padStart(6, "0")}`;
}

export default function FastestLap({ sessionKey }) {
  const [laps, setLaps] = useState([]);
  const [loading, setLoading] = useState(Boolean(sessionKey));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionKey) return undefined;

    let mounted = true;

    const load = async () => {
      try {
        const data = await getOpenF1Laps(sessionKey);
        if (mounted) {
          setLaps(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch {
        if (mounted) setError("No live data available");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [sessionKey]);

  const fastestLap = useMemo(
    () =>
      laps
        .filter((lap) => Number.isFinite(Number(lap.lap_duration)) && Number(lap.lap_duration) > 0)
        .sort((a, b) => Number(a.lap_duration) - Number(b.lap_duration))[0],
    [laps],
  );

  return (
    <CockpitPanel code="LAP.MIN" title="Fastest lap">
      {!sessionKey || error || (!loading && !fastestLap) ? (
        <p className="data-mono p-4 text-xs text-muted-foreground">No live data available</p>
      ) : (
        <div className="grid gap-4 p-4 sm:grid-cols-3">
          <div>
            <p className="label-eyebrow">driver_number</p>
            <p className="data-mono mt-2 text-2xl font-bold text-white">{fastestLap.driver_number}</p>
          </div>
          <div>
            <p className="label-eyebrow">lap_time</p>
            <p className="data-mono mt-2 text-2xl font-bold text-white">{formatLapTime(Number(fastestLap.lap_duration))}</p>
          </div>
          <div>
            <p className="label-eyebrow">lap_number</p>
            <p className="data-mono mt-2 text-2xl font-bold text-white">{fastestLap.lap_number ?? "-"}</p>
          </div>
        </div>
      )}
    </CockpitPanel>
  );
}

