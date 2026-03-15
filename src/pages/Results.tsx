import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Loader, AlertCircle } from "lucide-react";
import { raceCalendar } from "@/lib/data/raceCalendar";
import { apiClient } from "@/lib/api/client";
import { useDrivers } from "@/hooks/useDrivers";

interface RaceResult {
  id: string;
  raceId: string;
  type: "sprint" | "race";
  p1: string;
  p2: string;
  p3: string;
  pole: string;
  fastestLap: string;
  dnfCount: number;
  safetyCars: number;
  redFlags: number;
  bestConstructor?: string;
  isOfficial: boolean;
}

const Results = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const { drivers } = useDrivers();
  
  const getDriverName = (id?: string) => {
    if (!id) return "TBC";
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : id;
  };

  const now = new Date();
  const completedRaces = raceCalendar
    .filter(r => !r.cancelled && new Date(r.raceStartTime) < now)
    .sort((a, b) => a.round - b.round);
    
  const [selectedRaceId, setSelectedRaceId] = useState<string>(
    completedRaces.length > 0 ? completedRaces[completedRaces.length - 1].id : ""
  );
  
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authIsLoading) return;
    if (!selectedRaceId || !isAuthenticated) return;

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiClient.get<any>(`/api/leaderboard/results/${selectedRaceId}`);
        if (res.success && res.data) {
          setResults(res.data);
        } else {
          setError(res.error || "Failed to load results");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [selectedRaceId, isAuthenticated]);

  const selectedRaceName = raceCalendar.find(r => r.id === selectedRaceId)?.raceName;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12">
        <div className="mb-8 animate-slide-up">
          <h1 className="f1-heading text-3xl mb-2">Race Results</h1>
          <p className="text-muted-foreground text-sm">Official results from completed races</p>
        </div>

        {authIsLoading ? (
          <div className="glass rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px] animate-slide-up">
            <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Authenticating...</p>
          </div>
        ) : completedRaces.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center animate-slide-up">
            <p className="text-muted-foreground">No races have been completed yet this season.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 animate-slide-up">
            {/* Sidebar / Race Selector */}
            <div className="glass rounded-lg p-3 h-fit">
                <h2 className="f1-heading text-sm font-bold mb-3 uppercase tracking-wide">Races</h2>
              <div className="space-y-1.5">
                {completedRaces.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => setSelectedRaceId(race.id)}
                    className={`w-full text-left px-3 py-2.5 rounded text-xs transition-all ${
                      selectedRaceId === race.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{race.countryFlag}</span>
                      <span className="truncate flex-1 text-xs">{race.raceName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Display */}
            <div className="space-y-3 flex flex-col">
              {isLoading ? (
                <div className="glass rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading official results...</p>
                </div>
              ) : raceCalendar.find(r => r.id === selectedRaceId)?.cancelled ? (
                <div className="glass rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center border border-destructive/20">
                  <p className="text-destructive font-semibold text-sm">This race was cancelled.</p>
                </div>
              ) : error ? (
                <div className="glass rounded-xl p-8 border border-destructive/20 bg-destructive/5 flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
                  <div>
                    <h3 className="text-destructive font-semibold mb-1">Failed to Load</h3>
                    <p className="text-muted-foreground text-sm">{error}</p>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center border border-dashed border-border/50">
                  <p className="text-muted-foreground">No official results published for {selectedRaceName} yet.</p>
                </div>
              ) : (
                results.map((result) => (
                  <div key={result.id} className="glass rounded-lg border border-border/50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary/5 px-4 py-3 border-b border-border/50 flex items-center justify-between">
                      <div>
                        <h2 className="f1-heading text-base font-bold uppercase">{selectedRaceName}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">{result.type === "sprint" ? "⚡ Sprint" : "🏁 Grand Prix"}</p>
                      </div>
                      {result.isOfficial && (
                        <span className="bg-f1-gold/20 text-f1-gold text-xs px-2 py-1 rounded font-bold">
                          ✓ OFFICIAL
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 grid grid-cols-2 gap-4">
                      {/* Podium */}
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-2.5 uppercase tracking-wide">Podium</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🥇</span>
                            <span className="text-sm font-semibold text-f1-gold">{getDriverName(result.p1)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🥈</span>
                            <span className="text-sm font-semibold text-f1-silver">{getDriverName(result.p2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🥉</span>
                            <span className="text-sm font-semibold text-f1-bronze">{getDriverName(result.p3)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Standouts */}
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-2.5 uppercase tracking-wide">Standouts</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Pole</p>
                            <p className="text-sm font-semibold">{getDriverName(result.pole)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Best Constructor</p>
                            <p className="text-sm font-semibold text-f1-success">{result.bestConstructor || "TBC"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Results;
