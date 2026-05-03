import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getOpenF1CarData } from "@/lib/api/openf1";

const chartConfig = {
  speed: {
    label: "Speed",
    color: "hsl(var(--signal))",
  },
};

export default function TelemetryChart({ sessionKey, driverNumber }) {
  const [enabled, setEnabled] = useState(false);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !sessionKey || !driverNumber) return undefined;

    let mounted = true;
    setLoading(true);

    getOpenF1CarData(sessionKey, driverNumber)
      .then((data) => {
        if (mounted) {
          setSamples(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch(() => {
        if (mounted) setError("No live data available");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [driverNumber, enabled, sessionKey]);

  const chartData = useMemo(
    () =>
      samples
        .filter((sample) => Number.isFinite(Number(sample.speed)) && sample.date)
        .slice(-180)
        .map((sample) => ({
          time: new Date(sample.date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          speed: Number(sample.speed),
        })),
    [samples],
  );

  return (
    <CockpitPanel
      code="TEL.SPD"
      title="Telemetry"
      action={
        <Button variant="cockpit" size="sm" disabled={!sessionKey || !driverNumber} onClick={() => setEnabled(true)}>
          Load
        </Button>
      }
    >
      {!enabled ? (
        <p className="data-mono p-4 text-xs text-muted-foreground">Telemetry is available on demand.</p>
      ) : error || (!loading && chartData.length === 0) ? (
        <p className="data-mono p-4 text-xs text-muted-foreground">No live data available</p>
      ) : (
        <div className="p-4">
          <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={["dataMin - 10", "dataMax + 10"]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="speed" stroke="var(--color-speed)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </CockpitPanel>
  );
}

