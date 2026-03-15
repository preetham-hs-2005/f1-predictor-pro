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
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 animate-slide-up">
            {/* Sidebar / Race Selector */}
            <div className="glass rounded-xl p-4 h-fit flex flex-col gap-2">
              <h2 className="f1-heading text-lg mb-2 pl-2 border-b border-border/50 pb-2">Completed Races</h2>
              <div className="space-y-1">
                {completedRaces.map((race) => (
                  <button
                    key={race.id}
                    onClick={() => setSelectedRaceId(race.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      selectedRaceId === race.id
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "hover:bg-primary/10 text-muted-foreground hover:text-foreground border border-transparent hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{race.countryFlag}</span>
                      <span className="truncate">{race.raceName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Results Display */}
            <div className="flex flex-col gap-6">
              {isLoading ? (
                <div className="glass rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading official results...</p>
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
                  <div key={result.id} className="glass rounded-xl overflow-hidden shadow-lg border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="bg-primary/10 px-6 py-4 border-b border-border/50 flex items-center justify-between">
                      <h2 className="f1-heading tracking-wide uppercase">{selectedRaceName} - {result.type}</h2>
                      {result.isOfficial && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-bold tracking-wider shadow-sm">
                          OFFICIAL
                        </span>
                      )}
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-background/40 rounded-xl p-4 space-y-4 border border-border/30">
                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3 border-b border-border/50 pb-2">Podium</h3>
                        <div className="flex items-center gap-3 bg-background/50 p-2 rounded">
                          <span className="text-xl w-6 text-center">🥇</span>
                          <span className="font-bold text-lg text-f1-gold drop-shadow-sm">{getDriverName(result.p1)}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-background/50 p-2 rounded">
                          <span className="text-xl w-6 text-center">🥈</span>
                          <span className="font-bold text-lg text-f1-silver drop-shadow-sm">{getDriverName(result.p2)}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-background/50 p-2 rounded">
                          <span className="text-xl w-6 text-center">🥉</span>
                          <span className="font-bold text-lg text-f1-bronze drop-shadow-sm">{getDriverName(result.p3)}</span>
                        </div>
                      </div>

                      <div className="bg-background/40 rounded-xl p-4 space-y-4 border border-border/30">
                        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-3 border-b border-border/50 pb-2">Standouts</h3>
                        <div className="flex flex-col gap-1 bg-background/50 p-3 rounded h-[72px] justify-center">
                          <span className="text-xs uppercase tracking-wider font-bold text-primary">Pole Position</span>
                          <span className="font-semibold text-lg">{getDriverName(result.pole)}</span>
                        </div>
                        <div className="flex flex-col gap-1 bg-background/50 p-3 rounded h-[72px] justify-center mt-4">
                          <span className="text-xs uppercase tracking-wider font-bold text-f1-success border-f1-success/50">Best Scoring Constructor</span>
                          <span className="font-semibold text-lg">{result.bestConstructor || "TBC"}</span>
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
