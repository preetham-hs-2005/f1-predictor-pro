import { useEffect, useMemo, useState } from "react";
import { AlertCircle, FlagTriangleRight, Loader, Timer, Wrench } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllRaces } from "@/lib/api/races";
import { getF1RaceAnalysis } from "@/lib/api/formula1";
import {
  getOpenF1Drivers,
  getOpenF1Laps,
  getOpenF1Pit,
  getOpenF1Positions,
  getOpenF1RaceControl,
  getOpenF1Sessions,
  getOpenF1Stints,
} from "@/lib/api/openf1";
import { f1Drivers } from "@/lib/data/f1Grid";
import { cn } from "@/lib/utils";

const metricCards = [
  { key: "positions", label: "Position samples", icon: FlagTriangleRight },
  { key: "laps", label: "Lap records", icon: Timer },
  { key: "pit", label: "Pit events", icon: Wrench },
] as const;

const localDriverByNumber = new Map(f1Drivers.map((driver) => [driver.number, driver.name]));

const formatDuration = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string" && (value.includes(":") || value.includes("+") || value.toLowerCase().includes("lap") || value === "DNF")) {
    return value;
  }

  const seconds = Number(String(value).replace("s", ""));
  if (!Number.isFinite(seconds)) return String(value);

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds - minutes * 60;
  return `${minutes}:${remaining.toFixed(3).padStart(6, "0")}`;
};

const getDriverName = (driverNumber: unknown, directory: Map<number, string>) => {
  const number = Number(driverNumber);
  return directory.get(number) || localDriverByNumber.get(number) || "-";
};

const latestByDriver = (rows: any[]) => {
  const latest = new Map<number, any>();
  rows.forEach((row) => {
    const driverNumber = Number(row.driver_number);
    if (!Number.isFinite(driverNumber)) return;
    const existing = latest.get(driverNumber);
    if (!existing || new Date(row.date || 0).getTime() >= new Date(existing.date || 0).getTime()) {
      latest.set(driverNumber, row);
    }
  });
  return [...latest.values()].sort((a, b) => Number(a.position || 999) - Number(b.position || 999));
};

const buildStintsFromPitStops = (pitStops: any[], raceResults: any[]) => {
  const raceLapsByDriver = new Map(raceResults.map((row: any) => [String(row.driverNumber), Number(row.laps) || 0]));
  const stopsByDriver = new Map<string, any[]>();

  pitStops.forEach((stop) => {
    const key = String(stop.driverNumber);
    stopsByDriver.set(key, [...(stopsByDriver.get(key) || []), stop]);
  });

  return [...stopsByDriver.entries()].flatMap(([driverNumber, stops]) => {
    const orderedStops = stops.sort((a, b) => Number(a.lap) - Number(b.lap));
    const totalLaps = raceLapsByDriver.get(driverNumber) || Math.max(...orderedStops.map((stop) => Number(stop.lap) || 0));
    const driver = orderedStops[0];
    const boundaries = [0, ...orderedStops.map((stop) => Number(stop.lap) || 0), totalLaps];

    return boundaries.slice(0, -1).map((start, index) => ({
      driver_number: driverNumber,
      driver_name: driver.driver,
      team: driver.team,
      stint: index + 1,
      lap_start: start + 1,
      lap_end: boundaries[index + 1],
      source: "Derived from pit stops",
    }));
  });
};

const Results = () => {
  const [races, setRaces] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedRaces = useMemo(
    () =>
      races
        .filter((race) => !race.cancelled && new Date(race.raceStartTime) < new Date())
        .sort((a, b) => a.round - b.round),
    [races],
  );

  const resolveData = async <T,>(request: Promise<T>, fallback: T) => {
    try {
      return await request;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    getAllRaces().then((list) => {
      setRaces(list);
      const completed = list
        .filter((race) => !race.cancelled && new Date(race.raceStartTime) < new Date())
        .sort((a, b) => a.round - b.round);
      if (completed.length) setSelectedRaceId(completed[completed.length - 1].raceId);
    });
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedRaceId) return;
      const race = races.find((item) => item.raceId === selectedRaceId);
      if (!race) return;

      const raceStart = new Date(race.raceStartTime);
      const raceEndBuffer = new Date(raceStart.getTime() + 5 * 60 * 60 * 1000);
      if (new Date() < raceEndBuffer) {
        setData(null);
        setError("Race analysis unlocks after the event window closes.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const sessions = race.openF1RaceSessionKey
          ? []
          : await resolveData(getOpenF1Sessions(raceStart.getUTCFullYear(), race.country || ""), []);
        const raceSession = Array.isArray(sessions)
          ? sessions.find((session: any) => `${session.session_name} ${session.session_type}`.toLowerCase().includes("race"))
          : null;
        const sessionKey = race.openF1RaceSessionKey || raceSession?.session_key;

        if (!sessionKey) {
          const formula1Fallback = await resolveData(getF1RaceAnalysis(selectedRaceId), { raceResults: [], fastestLaps: [], pitStops: [], raceNotes: [] });
          if (!formula1Fallback.raceResults.length && !formula1Fallback.fastestLaps.length) {
            setData(null);
            setError("OpenF1 does not have a race session for this event yet.");
            return;
          }

          setData({
            positions: formula1Fallback.raceResults.map((row) => ({
              position: row.position,
              driver_number: row.driverNumber,
              driver_name: row.driver,
              team: row.team,
              laps: row.laps,
              time: row.time,
              points: row.points,
            })),
            laps: formula1Fallback.fastestLaps.map((row) => ({
              position: row.position,
              driver_number: row.driverNumber,
              driver_name: row.driver,
              team: row.team,
              lap_number: row.lap,
              lap_duration: row.time,
              average_speed: row.averageSpeed,
            })),
            raceControl: formula1Fallback.raceNotes.map((note, index) => ({
              date: "Official note",
              driver_number: "-",
              driver_name: "-",
              category: `Note ${index + 1}`,
              message: note,
            })),
            pit: formula1Fallback.pitStops.map((row) => ({
              stop: row.stop,
              driver_number: row.driverNumber,
              driver_name: row.driver,
              team: row.team,
              lap_number: row.lap,
              pit_duration: row.time,
              total: row.total,
              date: row.timeOfDay,
            })),
            stints: buildStintsFromPitStops(formula1Fallback.pitStops, formula1Fallback.raceResults),
          });
          return;
        }

        const [drivers, positions, laps, raceControl, pit, stints, formula1Fallback] = await Promise.all([
          resolveData(getOpenF1Drivers(sessionKey), []),
          resolveData(getOpenF1Positions(sessionKey), []),
          resolveData(getOpenF1Laps(sessionKey), []),
          resolveData(getOpenF1RaceControl(sessionKey), []),
          resolveData(getOpenF1Pit(sessionKey), []),
          resolveData(getOpenF1Stints(sessionKey), []),
          resolveData(getF1RaceAnalysis(selectedRaceId), { raceResults: [], fastestLaps: [], pitStops: [], raceNotes: [] }),
        ]);

        const driverDirectory = new Map<number, string>();
        if (Array.isArray(drivers)) {
          drivers.forEach((driver: any) => {
            if (driver.driver_number && driver.full_name) {
              driverDirectory.set(Number(driver.driver_number), driver.full_name);
            }
          });
        }

        const positionRows = Array.isArray(positions) && positions.length
          ? latestByDriver(positions).map((row) => ({
              ...row,
              driver_name: getDriverName(row.driver_number, driverDirectory),
            }))
          : formula1Fallback.raceResults.map((row) => ({
              position: row.position,
              driver_number: row.driverNumber,
              driver_name: row.driver,
              team: row.team,
              laps: row.laps,
              time: row.time,
              points: row.points,
            }));

        const lapRows = Array.isArray(laps) && laps.length
          ? laps.map((row: any) => ({
              ...row,
              driver_name: getDriverName(row.driver_number, driverDirectory),
              lap_duration: formatDuration(row.lap_duration),
            }))
          : formula1Fallback.fastestLaps.map((row) => ({
              position: row.position,
              driver_number: row.driverNumber,
              driver_name: row.driver,
              team: row.team,
              lap_number: row.lap,
              lap_duration: row.time,
              average_speed: row.averageSpeed,
            }));

        const pitRows = Array.isArray(pit) && pit.length
          ? pit.map((row: any) => ({
              ...row,
              driver_name: getDriverName(row.driver_number, driverDirectory),
              pit_duration: formatDuration(row.pit_duration),
            }))
          : formula1Fallback.pitStops.map((row) => ({
              stop: row.stop,
              driver_number: row.driverNumber,
              driver_name: row.driver,
              team: row.team,
              lap_number: row.lap,
              pit_duration: row.time,
              total: row.total,
              date: row.timeOfDay,
            }));

        const stintRows = Array.isArray(stints) && stints.length
          ? stints.map((row: any) => ({
              ...row,
              driver_name: getDriverName(row.driver_number, driverDirectory),
            }))
          : buildStintsFromPitStops(formula1Fallback.pitStops, formula1Fallback.raceResults);

        const raceControlRows = Array.isArray(raceControl) && raceControl.length
          ? raceControl.map((row: any) => ({
              ...row,
              driver_name: getDriverName(row.driver_number, driverDirectory),
            }))
          : formula1Fallback.raceNotes.map((note, index) => ({
              date: "Official note",
              driver_number: "-",
              driver_name: "-",
              category: `Note ${index + 1}`,
              message: note,
            }));

        setData({ positions: positionRows, laps: lapRows, raceControl: raceControlRows, pit: pitRows, stints: stintRows });
      } catch (e: any) {
        setData(null);
        setError(e.message || "Failed to load race analysis.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [selectedRaceId, races]);

  const selectedRace = races.find((race) => race.raceId === selectedRaceId);

  const previewTable = (rows: any[], cols: Array<{ key: string; label: string }>) => (
    <div className="panel overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface-2/80 text-left">
            <tr>
              {cols.map((column) => (
                <th key={column.key} className="data-mono px-4 py-3 text-[10px] uppercase text-muted-foreground">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 24).map((row, index) => (
              <tr key={index} className="border-t border-border/70 transition-colors hover:bg-surface-2/45">
                {cols.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-white/85">
                    {String(row?.[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="flex min-h-[180px] items-center justify-center p-6 text-center">
          <p className="data-mono max-w-md text-xs uppercase leading-6 text-muted-foreground">
            No samples returned for this feed. OpenF1 may still be publishing data or temporarily rate limited.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-[1500px] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <section className="panel panel-corners overflow-hidden">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_360px] lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="label-eyebrow">Race analysis</span>
                <span className="h-px w-16 bg-border" />
                <Badge className="badge-signal">OpenF1 telemetry</Badge>
              </div>
              <h1 className="display mt-6 max-w-4xl text-4xl font-bold leading-[0.95] text-white sm:text-6xl">
                Session Data Review
              </h1>
              <p className="data-mono mt-5 max-w-3xl text-sm uppercase leading-6 text-muted-foreground">
                Pick a completed Grand Prix and inspect positions, lap flow, pit stops, stints, and race control.
              </p>
            </div>

            <div className="border border-border bg-surface-2/45 p-4">
              <p className="label-eyebrow">Selected event</p>
              <p className="display mt-3 text-2xl font-semibold text-white">{selectedRace?.raceName || "No race selected"}</p>
              <p className="data-mono mt-2 text-xs uppercase text-muted-foreground">
                {selectedRace ? `Round ${selectedRace.round} / ${selectedRace.circuitName}` : "Waiting for completed races"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden border border-border bg-surface-1">
          <div className="flex min-w-full overflow-x-auto">
            {completedRaces.map((race) => (
              <button
                key={race.raceId}
                onClick={() => setSelectedRaceId(race.raceId)}
                className={cn(
                  "w-60 shrink-0 border-r border-border px-4 py-3 text-left transition-colors hover:bg-surface-2/60",
                  selectedRaceId === race.raceId && "bg-signal/10",
                )}
              >
                <div className="data-mono text-[10px] uppercase text-muted-foreground">Round {race.round}</div>
                <div className="mt-1 truncate font-semibold text-white">{race.raceName}</div>
              </button>
            ))}
          </div>
        </section>

        {isLoading && (
          <div className="section-card mt-6 flex items-center gap-3">
            <Loader className="h-4 w-4 animate-spin text-signal" />
            <span className="data-mono text-sm uppercase text-muted-foreground">Loading OpenF1 feeds...</span>
          </div>
        )}

        {error && (
          <div className="section-card mt-6 flex items-center gap-3 border-warning/30 bg-warning/10 text-warning">
            <AlertCircle className="h-4 w-4" />
            <span className="data-mono text-sm uppercase">{error}</span>
          </div>
        )}

        {data && (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              {metricCards.map(({ key, label, icon: Icon }) => (
                <div key={key} className="panel p-4">
                  <Icon className="h-4 w-4 text-signal" />
                  <p className="data-mono mt-5 text-3xl font-bold text-white">{data[key]?.length || 0}</p>
                  <p className="label-eyebrow mt-1">{label}</p>
                </div>
              ))}
            </section>

            <Tabs defaultValue="position" className="mt-8">
              <TabsList className="grid w-full grid-cols-2 border border-border bg-surface-1 p-1 md:grid-cols-5">
                <TabsTrigger value="position">Position</TabsTrigger>
                <TabsTrigger value="laps">Laps</TabsTrigger>
                <TabsTrigger value="stints">Stints</TabsTrigger>
                <TabsTrigger value="pit">Pit</TabsTrigger>
                <TabsTrigger value="raceControl">Race Ctrl</TabsTrigger>
              </TabsList>

              <TabsContent value="position" className="mt-6">
                {previewTable(data.positions, [
                  { key: "position", label: "Pos" },
                  { key: "driver_number", label: "No." },
                  { key: "driver_name", label: "Driver" },
                  { key: "team", label: "Team" },
                  { key: "laps", label: "Laps" },
                  { key: "time", label: "Time / Gap" },
                  { key: "points", label: "Pts" },
                ])}
              </TabsContent>
              <TabsContent value="laps" className="mt-6">
                {previewTable(data.laps, [
                  { key: "position", label: "Rank" },
                  { key: "driver_number", label: "No." },
                  { key: "driver_name", label: "Driver" },
                  { key: "team", label: "Team" },
                  { key: "lap_number", label: "Lap" },
                  { key: "lap_duration", label: "Time" },
                  { key: "average_speed", label: "Avg speed" },
                ])}
              </TabsContent>
              <TabsContent value="stints" className="mt-6">
                {previewTable(data.stints, [
                  { key: "driver_number", label: "No." },
                  { key: "driver_name", label: "Driver" },
                  { key: "team", label: "Team" },
                  { key: "stint", label: "Stint" },
                  { key: "lap_start", label: "Start" },
                  { key: "lap_end", label: "End" },
                  { key: "source", label: "Source" },
                ])}
              </TabsContent>
              <TabsContent value="pit" className="mt-6">
                {previewTable(data.pit, [
                  { key: "driver_number", label: "No." },
                  { key: "driver_name", label: "Driver" },
                  { key: "team", label: "Team" },
                  { key: "lap_number", label: "Lap" },
                  { key: "pit_duration", label: "Duration" },
                  { key: "total", label: "Total" },
                  { key: "date", label: "Time of day" },
                ])}
              </TabsContent>
              <TabsContent value="raceControl" className="mt-6">
                {previewTable(data.raceControl, [
                  { key: "date", label: "Date" },
                  { key: "driver_number", label: "No." },
                  { key: "driver_name", label: "Driver" },
                  { key: "category", label: "Category" },
                  { key: "message", label: "Message" },
                ])}
              </TabsContent>
            </Tabs>

            <div className="panel mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 p-4 data-mono text-[10px] text-muted-foreground">
              <span>OPENF1 FEED + FORMULA1.COM FALLBACK</span>
              <span>ROWS LIMITED TO 24 PER FEED</span>
              <span className="lg:ml-auto">RADIO AND WEATHER HIDDEN</span>
            </div>
          </>
        )}
      </main>
    </PageShell>
  );
};

export default Results;
