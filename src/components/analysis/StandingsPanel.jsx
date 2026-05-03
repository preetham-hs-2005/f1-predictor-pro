import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

/**
 * Standings Panel Component
 * Shows driver and constructor championship standings
 * Default: shows top 5 with "View All" button
 * Expandable for full standings
 */
export default function StandingsPanel({ driverStandings = [], constructorStandings = [], loading = false }) {
  const [expandedTab, setExpandedTab] = useState("drivers");
  const [showAll, setShowAll] = useState(false);

  const displayDrivers = useMemo(() => {
    const data = Array.isArray(driverStandings) ? driverStandings : [];
    return showAll ? data : data.slice(0, 5);
  }, [driverStandings, showAll]);

  const displayConstructors = useMemo(() => {
    const data = Array.isArray(constructorStandings) ? constructorStandings : [];
    return showAll ? data : data.slice(0, 5);
  }, [constructorStandings, showAll]);

  const tabs = [
    { id: "drivers", label: "Drivers", count: driverStandings?.length || 0 },
    { id: "constructors", label: "Constructors", count: constructorStandings?.length || 0 },
  ];

  return (
    <CockpitPanel code="STAND" title="Championship standings" corners className="flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border bg-surface-2/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setExpandedTab(tab.id);
              setShowAll(false);
            }}
            className={`flex-1 px-4 py-3 data-mono text-xs font-semibold transition-colors ${
              expandedTab === tab.id
                ? "border-b-2 border-signal text-signal bg-signal/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.label}</span>
            <Badge variant="outline" className="ml-2 inline-flex h-5 min-w-5 items-center justify-center bg-surface-1 text-xs">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center p-4">
            <p className="data-mono text-xs text-muted-foreground">Loading standings...</p>
          </div>
        ) : expandedTab === "drivers" ? (
          driverStandings.length === 0 ? (
            <p className="data-mono p-4 text-xs text-muted-foreground">No driver standings available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">POS</TableHead>
                  <TableHead>DRIVER</TableHead>
                  <TableHead className="w-20 text-right">PTS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayDrivers.map((driver) => (
                  <TableRow key={driver.driverId} className="hover:bg-surface-2/50">
                    <TableCell className="data-mono font-bold text-signal">
                      {driver.position}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <span>{driver.countryFlag}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{driver.driverName}</p>
                        <p className="data-mono text-xs text-muted-foreground">
                          {driver.wins}W • {driver.podiums}P
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="data-mono font-bold text-right text-signal">
                      {driver.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        ) : (
          constructorStandings.length === 0 ? (
            <p className="data-mono p-4 text-xs text-muted-foreground">No constructor standings available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">POS</TableHead>
                  <TableHead>TEAM</TableHead>
                  <TableHead className="w-20 text-right">PTS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayConstructors.map((constructor) => (
                  <TableRow
                    key={constructor.team}
                    className="hover:bg-surface-2/50"
                    style={{ borderLeftColor: constructor.teamColor, borderLeftWidth: "3px" }}
                  >
                    <TableCell className="data-mono font-bold text-signal">
                      {constructor.position}
                    </TableCell>
                    <TableCell className="font-semibold">{constructor.team}</TableCell>
                    <TableCell className="data-mono font-bold text-right text-signal">
                      {constructor.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </div>

      {/* View All / View Less Toggle */}
      {(driverStandings.length > 5 || constructorStandings.length > 5) && (
        <div className="border-t border-border bg-surface-2/30 p-3">
          <button
            onClick={() => setShowAll(!showAll)}
            className="data-mono w-full text-xs font-semibold text-signal transition-colors hover:text-signal/80 flex items-center justify-center gap-1"
          >
            {showAll ? "View Less" : "View All"}
            <ChevronDown className={`h-3 w-3 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </CockpitPanel>
  );
}
