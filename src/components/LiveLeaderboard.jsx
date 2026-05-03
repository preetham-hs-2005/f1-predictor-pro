import { useEffect, useMemo, useState } from "react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOpenF1Positions } from "@/lib/api/openf1";

function latestPositions(samples) {
  const byDriver = new Map();

  samples.forEach((sample) => {
    const current = byDriver.get(sample.driver_number);
    if (!current || new Date(sample.date) > new Date(current.date)) {
      byDriver.set(sample.driver_number, sample);
    }
  });

  return Array.from(byDriver.values()).sort((a, b) => Number(a.position) - Number(b.position));
}

export default function LiveLeaderboard({ sessionKey }) {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(Boolean(sessionKey));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionKey) return undefined;

    let mounted = true;

    const load = async () => {
      try {
        const data = await getOpenF1Positions(sessionKey);
        if (mounted) {
          setPositions(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch {
        if (mounted) setError("No live data available");
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

  const rows = useMemo(() => latestPositions(positions), [positions]);

  return (
    <CockpitPanel code="LIVE.POS" title="Live leaderboard" className="overflow-hidden">
      {!sessionKey || error || (!loading && rows.length === 0) ? (
        <p className="data-mono p-4 text-xs text-muted-foreground">No live data available</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>position</TableHead>
              <TableHead>driver_number</TableHead>
              <TableHead>gap_to_leader</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.driver_number}>
                <TableCell className="data-mono font-bold text-white">{row.position}</TableCell>
                <TableCell className="data-mono">{row.driver_number}</TableCell>
                <TableCell className="data-mono">{row.gap_to_leader ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CockpitPanel>
  );
}

