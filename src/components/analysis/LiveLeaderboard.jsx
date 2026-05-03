import { useEffect, useMemo, useState } from "react";
import { Loader, TrendingDown } from "lucide-react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOpenF1Positions } from "@/lib/api/openf1";
import { getLatestPositions, formatGapToLeader } from "@/services/raceAnalysisService.js";

/**
 * Live Leaderboard Component
 * Displays current race positions with gap to leader
 * Polls every 5 seconds for live updates
 */
export default function LiveLeaderboard({ sessionKey, onDriverSelect }) {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(Boolean(sessionKey));
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!sessionKey) return undefined;

    let mounted = true;

    const load = async () => {
      try {
        const data = await getOpenF1Positions(sessionKey);
        if (mounted) {
          setPositions(Array.isArray(data) ? data : []);
          setLastUpdate(new Date());
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load live positions");
          console.error("[LiveLeaderboard] Error:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [sessionKey]);

  const rows = useMemo(() => getLatestPositions(positions), [positions]);

  const updateTimestamp = lastUpdate ? lastUpdate.toLocaleTimeString() : null;

  return (
    <CockpitPanel code="LIVE.POS" title="Live leaderboard" corners>
      {!sessionKey || error ? (
        <div className="flex items-center gap-2 p-4 text-muted-foreground">
          <span className="data-mono text-xs">{error || "No session selected"}</span>
        </div>
      ) : loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader className="h-5 w-5 animate-spin text-signal" />
        </div>
      ) : rows.length === 0 ? (
        <p className="data-mono p-4 text-xs text-muted-foreground">No live data available</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">POS</TableHead>
                <TableHead className="w-20">DRV#</TableHead>
                <TableHead>GAP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.driver_number}
                  className="cursor-pointer transition-colors hover:bg-surface-2/50"
                  onClick={() => onDriverSelect?.(row.driver_number)}
                >
                  <TableCell className="data-mono font-bold text-signal">{row.position}</TableCell>
                  <TableCell className="data-mono font-semibold">{row.driver_number}</TableCell>
                  <TableCell className="data-mono text-xs">
                    {formatGapToLeader(row.gap_to_leader)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {updateTimestamp && (
            <div className="border-t border-border bg-surface-2/30 px-4 py-2">
              <p className="data-mono text-xs text-muted-foreground">Updated: {updateTimestamp}</p>
            </div>
          )}
        </div>
      )}
    </CockpitPanel>
  );
}
