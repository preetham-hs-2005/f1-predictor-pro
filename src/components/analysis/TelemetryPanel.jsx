import { useEffect, useMemo, useState } from "react";
import { Loader, BarChart3 } from "lucide-react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { getOpenF1CarData } from "@/lib/api/openf1";
import { downsampleTelemetry, formatSpeed } from "@/services/raceAnalysisService.js";

/**
 * Telemetry Panel Component
 * Displays car telemetry data for selected driver
 * Lazy loads data only when driver is selected
 * Includes speed graph visualization
 */
export default function TelemetryPanel({ sessionKey, selectedDriverNumber }) {
  const [carData, setCarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minSpeed, setMinSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);

  useEffect(() => {
    if (!sessionKey || !selectedDriverNumber) {
      setCarData([]);
      setError(null);
      return undefined;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getOpenF1CarData(sessionKey, selectedDriverNumber);
        if (mounted) {
          const downsampled = downsampleTelemetry(Array.isArray(data) ? data : []);
          setCarData(downsampled);
          
          // Calculate min/max speed
          const speeds = downsampled
            .map((d) => Number(d.speed))
            .filter(Number.isFinite);
          setMinSpeed(Math.min(...speeds) || 0);
          setMaxSpeed(Math.max(...speeds) || 0);
          
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load telemetry");
          console.error("[TelemetryPanel] Error:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [sessionKey, selectedDriverNumber]);

  const speedSamples = useMemo(() => {
    if (carData.length === 0) return [];
    return carData
      .map((d) => Number(d.speed))
      .filter(Number.isFinite);
  }, [carData]);

  const avgSpeed = useMemo(() => {
    if (speedSamples.length === 0) return 0;
    return speedSamples.reduce((a, b) => a + b) / speedSamples.length;
  }, [speedSamples]);

  return (
    <CockpitPanel code="TELEM" title={`Telemetry - Driver #${selectedDriverNumber || "?"}`} corners>
      {!sessionKey || !selectedDriverNumber ? (
        <div className="flex items-center gap-2 p-6 text-muted-foreground">
          <BarChart3 className="h-5 w-5" />
          <span className="data-mono text-xs">Select a driver to view telemetry</span>
        </div>
      ) : loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader className="h-5 w-5 animate-spin text-signal" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 text-destructive">
          <span className="data-mono text-xs">{error}</span>
        </div>
      ) : carData.length === 0 ? (
        <p className="data-mono p-4 text-xs text-muted-foreground">No telemetry data available</p>
      ) : (
        <div className="space-y-4 p-4 sm:p-6">
          {/* Stats Overview */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-border bg-surface-2/50 rounded p-4">
              <p className="label-eyebrow">Min Speed</p>
              <p className="display mt-2 text-2xl font-bold text-white">
                {formatSpeed(minSpeed)}
              </p>
            </div>
            <div className="border border-border bg-signal/10 rounded p-4 border-signal/30">
              <p className="label-eyebrow">Avg Speed</p>
              <p className="display mt-2 text-2xl font-bold text-signal">
                {formatSpeed(avgSpeed)}
              </p>
            </div>
            <div className="border border-border bg-surface-2/50 rounded p-4">
              <p className="label-eyebrow">Max Speed</p>
              <p className="display mt-2 text-2xl font-bold text-white">
                {formatSpeed(maxSpeed)}
              </p>
            </div>
          </div>

          {/* Simple Speed Graph */}
          {speedSamples.length > 0 && (
            <div className="border border-border bg-surface-2/30 rounded p-4">
              <p className="label-eyebrow mb-3">Speed profile</p>
              <div className="flex items-end gap-0.5 h-24">
                {speedSamples.slice(-100).map((speed, idx) => {
                  const heightPercent = maxSpeed > 0 ? ((speed - minSpeed) / (maxSpeed - minSpeed)) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-signal/60 rounded-t min-h-1"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      title={`${formatSpeed(speed)}`}
                    />
                  );
                })}
              </div>
              <p className="data-mono text-xs text-muted-foreground mt-2">
                Showing last 100 samples • {speedSamples.length} total samples
              </p>
            </div>
          )}
        </div>
      )}
    </CockpitPanel>
  );
}
