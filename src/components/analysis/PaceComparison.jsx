import { useEffect, useMemo, useState } from "react";
import { Loader } from "lucide-react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOpenF1Laps } from "@/lib/api/openf1";
import { getPaceComparison, formatLapTime } from "@/services/raceAnalysisService.js";

/**
 * Pace Comparison Component
 * Shows average lap time for each driver
 * Sorts by fastest average pace
 */
export default function PaceComparison({ sessionKey, onDriverSelect }) {
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
      } catch (err) {
        if (mounted) {
          setError("Failed to load lap data");
          console.error("[PaceComparison] Error:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [sessionKey]);

  const paceData = useMemo(() => getPaceComparison(laps), [laps]);

  return (
    <CockpitPanel code="PACE.CMP" title="Pace comparison" corners>
      {!sessionKey || error ? (
        <div className="flex items-center gap-2 p-4 text-muted-foreground">
          <span className="data-mono text-xs">{error || "No session selected"}</span>
        </div>
      ) : loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader className="h-5 w-5 animate-spin text-signal" />
        </div>
      ) : paceData.length === 0 ? (
        <p className="data-mono p-4 text-xs text-muted-foreground">No lap data available</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20">DRV#</TableHead>
                <TableHead>AVG LAP TIME</TableHead>
                <TableHead className="w-20">LAPS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paceData.map((driver, index) => {
                const isPaceLeader = index === 0;
                return (
                  <TableRow
                    key={driver.driverNumber}
                    className={`cursor-pointer transition-colors hover:bg-surface-2/50 ${
                      isPaceLeader ? "bg-signal/5" : ""
                    }`}
                    onClick={() => onDriverSelect?.(driver.driverNumber)}
                  >
                    <TableCell className="data-mono font-semibold">
                      {driver.driverNumber}
                    </TableCell>
                    <TableCell className={`data-mono font-semibold ${isPaceLeader ? "text-signal" : ""}`}>
                      {formatLapTime(driver.averagePace)}
                    </TableCell>
                    <TableCell className="data-mono text-xs text-muted-foreground">
                      {driver.lapCount}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </CockpitPanel>
  );
}
