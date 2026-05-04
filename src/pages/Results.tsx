import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllRaces } from "@/lib/api/races";
import {
  getOpenF1Constructors,
  getOpenF1Drivers,
  getOpenF1Laps,
  getOpenF1Pit,
  getOpenF1Positions,
  getOpenF1RaceControl,
  getOpenF1Sessions,
  getOpenF1Stints,
  getOpenF1TeamRadio,
  getOpenF1Weather,
} from "@/lib/api/openf1";

const Results = () => {
  const [races, setRaces] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedRaces = useMemo(
    () => races.filter((r) => !r.cancelled && new Date(r.raceStartTime) < new Date()).sort((a, b) => a.round - b.round),
    [races],
  );

  useEffect(() => {
    getAllRaces().then((list) => {
      setRaces(list);
      const completed = list.filter((r) => !r.cancelled && new Date(r.raceStartTime) < new Date()).sort((a, b) => a.round - b.round);
      if (completed.length) setSelectedRaceId(completed[completed.length - 1].raceId);
    });
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedRaceId) return;
      const race = races.find((r) => r.raceId === selectedRaceId);
      if (!race) return;

      const raceStart = new Date(race.raceStartTime);
      const raceEndBuffer = new Date(raceStart.getTime() + 5 * 60 * 60 * 1000);
      if (new Date() < raceEndBuffer) {
        setData(null);
        setError("Race weekend is still active. OpenF1 polling is paused until after the event window.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const sessions = await getOpenF1Sessions(raceStart.getUTCFullYear(), race.country || "");
        const raceSession = Array.isArray(sessions)
          ? sessions.find((s: any) => `${s.session_name} ${s.session_type}`.toLowerCase().includes("race"))
          : null;

        if (!raceSession?.session_key) throw new Error("OpenF1 race session not found for this round.");

        const sessionKey = raceSession.session_key;
        const [drivers, constructors, positions, laps, raceControl, pit, stints, teamRadio, weather] = await Promise.all([
          getOpenF1Drivers(sessionKey),
          getOpenF1Constructors(sessionKey),
          getOpenF1Positions(sessionKey),
          getOpenF1Laps(sessionKey),
          getOpenF1RaceControl(sessionKey),
          getOpenF1Pit(sessionKey),
          getOpenF1Stints(sessionKey),
          getOpenF1TeamRadio(sessionKey),
          getOpenF1Weather(sessionKey),
        ]);

        setData({ drivers, constructors, positions, laps, raceControl, pit, stints, teamRadio, weather });
      } catch (e: any) {
        setError(e.message || "Failed to load OpenF1 race analysis.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [selectedRaceId, races]);

  const selectedRace = races.find((r) => r.raceId === selectedRaceId);

  const previewTable = (rows: any[], cols: string[]) => (
    <div className="overflow-auto border border-border bg-surface-1">
      <table className="w-full text-sm">
        <thead className="bg-surface-2/70 text-left">
          <tr>{cols.map((c) => <th key={c} className="px-3 py-2">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((r, i) => (
            <tr key={i} className="border-t border-border/60">{cols.map((c) => <td key={c} className="px-3 py-2">{String(r?.[c] ?? "-")}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <PageShell>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-bold text-white">Race Analysis</h1>
          <Badge className="badge-signal">OpenF1 Powered</Badge>
        </div>

        <div className="mb-6 overflow-x-auto border border-border bg-surface-1">
          <div className="flex min-w-max">
            {completedRaces.map((race) => (
              <button key={race.raceId} onClick={() => setSelectedRaceId(race.raceId)} className={`w-56 border-r border-border px-4 py-3 text-left ${selectedRaceId === race.raceId ? "bg-signal/10" : ""}`}>
                <div className="text-xs text-muted-foreground">R{race.round}</div>
                <div className="font-semibold text-white">{race.raceName}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">{selectedRace ? `${selectedRace.countryFlag} ${selectedRace.raceName}` : "Select a race"}</div>

        {isLoading && <div className="section-card flex items-center gap-2"><Loader className="h-4 w-4 animate-spin" /> Loading OpenF1 data…</div>}
        {error && <div className="section-card border-destructive/30 text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</div>}

        {data && (
          <Tabs defaultValue="standings" className="mt-4">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-9">
              <TabsTrigger value="standings">Standings</TabsTrigger><TabsTrigger value="position">Position</TabsTrigger><TabsTrigger value="laps">Laps</TabsTrigger><TabsTrigger value="stints">Stints</TabsTrigger><TabsTrigger value="pit">Pit</TabsTrigger><TabsTrigger value="raceControl">Race Ctrl</TabsTrigger><TabsTrigger value="radio">Radio</TabsTrigger><TabsTrigger value="weather">Weather</TabsTrigger><TabsTrigger value="telemetry">Telemetry</TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Driver Championship</h2>
              {previewTable(data.drivers, ["driver_number", "full_name", "team_name", "points", "position"])}
              <h2 className="text-xl font-semibold text-white">Constructor Championship</h2>
              {previewTable(data.constructors, ["name", "points", "position"])}
            </TabsContent>
            <TabsContent value="position">{previewTable(data.positions, ["date", "driver_number", "position", "gap_to_leader"])}</TabsContent>
            <TabsContent value="laps">{previewTable(data.laps, ["driver_number", "lap_number", "lap_duration"])}</TabsContent>
            <TabsContent value="stints">{previewTable(data.stints, ["driver_number", "lap_start", "lap_end", "compound"])}</TabsContent>
            <TabsContent value="pit">{previewTable(data.pit, ["driver_number", "lap_number", "pit_duration", "date"])}</TabsContent>
            <TabsContent value="raceControl">{previewTable(data.raceControl, ["date", "driver_number", "category", "message"])} </TabsContent>
            <TabsContent value="radio">{previewTable(data.teamRadio, ["date", "driver_number", "recording_url"])}</TabsContent>
            <TabsContent value="weather">{previewTable(data.weather, ["date", "air_temperature", "track_temperature", "rainfall", "humidity"])}</TabsContent>
            <TabsContent value="telemetry"><p className="text-sm text-muted-foreground">Telemetry can be loaded per driver on demand to keep the UI lightweight.</p></TabsContent>
          </Tabs>
        )}
      </main>
    </PageShell>
  );
};

export default Results;
