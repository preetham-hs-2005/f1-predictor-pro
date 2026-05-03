import { useEffect, useMemo, useState } from "react";
import { Loader, Zap } from "lucide-react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getOpenF1Laps } from "@/lib/api/openf1";
import { getTopFastestLaps, formatLapTime } from "@/services/raceAnalysisService.js";

/**
 * Fastest Laps Component
 * Displays top 5 fastest laps
 * Highlights the fastest lap overall
 */
export default function FastestLaps({ sessionKey, onDriverSelect }) {
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
          setError("Failed to load laps");
          console.error("[FastestLaps] Error:", err);
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

  const topLaps = useMemo(() => getTopFastestLaps(laps, 5), [laps]);

  return (
    <CockpitPanel code="LAP.TOP5" title="Fastest laps" corners>
      {!sessionKey || error ? (
        <div className="flex items-center gap-2 p-4 text-muted-foreground">
          <span className="data-mono text-xs">{error || "No session selected"}</span>
        </div>
      ) : loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader className="h-5 w-5 animate-spin text-signal" />
        </div>
      ) : topLaps.length === 0 ? (
        <p className="data-mono p-4 text-xs text-muted-foreground">No lap data available</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">RANK</TableHead>
                <TableHead className="w-20">DRV#</TableHead>
                <TableHead>LAP TIME</TableHead>
                <TableHead className="w-16">LAP #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topLaps.map((lap, index) => (
                <TableRow
                  key={`${lap.driver_number}-${lap.lap_number}`}
                  className="cursor-pointer transition-colors hover:bg-surface-2/50"
                  onClick={() => onDriverSelect?.(lap.driver_number)}
                >
                  <TableCell className="data-mono font-bold">
                    {index === 0 ? (
                      <Badge className="border-signal/30 bg-signal/10 text-signal">
                        <Zap className="mr-1 h-3 w-3" />
                        1st
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </TableCell>
                  <TableCell className="data-mono font-semibold">{lap.driver_number}</TableCell>
                  <TableCell className="data-mono font-semibold text-signal">
                    {formatLapTime(Number(lap.lap_duration))}
                  </TableCell>
                  <TableCell className="data-mono text-xs text-muted-foreground">
                    {lap.lap_number ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CockpitPanel>
  );
}
