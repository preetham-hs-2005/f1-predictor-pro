import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Loader, AlertCircle, X, CheckCircle2, Trophy } from "lucide-react";
import { raceCalendar } from "@/lib/data/raceCalendar";
import { apiClient } from "@/lib/api/client";
import { useDrivers } from "@/hooks/useDrivers";
import { Badge } from "@/components/ui/badge";

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
    .filter(r => new Date(r.raceStartTime) < now)
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
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 animate-slide-up">
            {/* Sidebar / Race Selector */}
            <div className="space-y-4">
              <div className="glass rounded-xl p-5 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors h-fit">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                  <Trophy className="h-5 w-5 text-f1-gold" />
                  <h2 className="f1-heading text-base font-bold tracking-wider">CHOOSE RACE</h2>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {completedRaces.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {completedRaces.map((race, idx) => (
                    <button
                      key={race.id}
                      onClick={() => setSelectedRaceId(race.id)}
                      className={`w-full text-left px-4 py-4 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 group relative overflow-hidden ${
                        selectedRaceId === race.id
                          ? "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 scale-[1.02]"
                          : "bg-background/40 text-muted-foreground hover:text-foreground border border-border/30 hover:border-primary/50 hover:bg-background/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <span className="text-2xl">{race.countryFlag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-foreground">{race.raceName}</div>
                          <div className={`text-xs ${selectedRaceId === race.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            Round {race.round}
                          </div>
                        </div>
                        {race.cancelled ? (
                          <Badge variant="destructive" className="ml-auto text-xs gap-1 shrink-0 animate-pulse">
                            <X className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <CheckCircle2 className={`h-4 w-4 ml-auto shrink-0 ${selectedRaceId === race.id ? "text-primary-foreground" : "text-f1-success"}`} />
                        )}
                      </div>
                      {selectedRaceId === race.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="space-y-4 flex flex-col">
              {isLoading ? (
                <div className="glass rounded-xl p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading official results...</p>
                </div>
              ) : raceCalendar.find(r => r.id === selectedRaceId)?.cancelled ? (
                <div className="glass rounded-xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center border border-destructive/20 bg-gradient-to-br from-destructive/10 via-background to-background">
                  <div className="mb-4 animate-pulse">
                    <X className="h-16 w-16 text-destructive mx-auto" />
                  </div>
                  <h3 className="f1-heading text-3xl text-destructive mb-3 font-bold">Race Cancelled</h3>
                  <p className="text-muted-foreground text-lg max-w-sm">This race was cancelled. No official results are available.</p>
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
                  <div key={result.id} className="glass rounded-xl overflow-hidden shadow-lg border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent px-6 py-5 border-b border-border/50 flex items-center justify-between backdrop-blur-sm">
                      <div>
                        <h2 className="f1-heading tracking-wider uppercase text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {selectedRaceName}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-semibold">
                          {result.type === "sprint" ? "⚡ Sprint · 0.5× Points" : "🏁 Grand Prix"}
                        </p>
                      </div>
                      {result.isOfficial && (
                        <span className="bg-gradient-to-r from-f1-gold to-f1-gold/70 text-background text-xs px-3 py-2 rounded-lg font-bold tracking-wider shadow-lg shadow-f1-gold/30 animate-pulse">
                          ✓ OFFICIAL
                        </span>
                      )}
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Podium Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                          <Trophy className="h-5 w-5 text-f1-gold" />
                          <h3 className="text-xs uppercase tracking-wider font-bold">Podium Finishers</h3>
                        </div>
                        
                        {/* P1 */}
                        <div className="bg-gradient-to-br from-f1-gold/20 to-transparent rounded-xl p-4 border border-f1-gold/30 hover:border-f1-gold/50 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl font-black">🥇</span>
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">P1</span>
                          </div>
                          <p className="font-bold text-lg text-f1-gold drop-shadow-lg">{getDriverName(result.p1)}</p>
                        </div>

                        {/* P2 */}
                        <div className="bg-gradient-to-br from-f1-silver/20 to-transparent rounded-xl p-4 border border-f1-silver/30 hover:border-f1-silver/50 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl font-black">🥈</span>
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">P2</span>
                          </div>
                          <p className="font-bold text-lg text-f1-silver drop-shadow-lg">{getDriverName(result.p2)}</p>
                        </div>

                        {/* P3 */}
                        <div className="bg-gradient-to-br from-f1-bronze/20 to-transparent rounded-xl p-4 border border-f1-bronze/30 hover:border-f1-bronze/50 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl font-black">🥉</span>
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">P3</span>
                          </div>
                          <p className="font-bold text-lg text-f1-bronze drop-shadow-lg">{getDriverName(result.p3)}</p>
                        </div>
                      </div>

                      {/* Standouts Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
                          <span className="text-lg">⭐</span>
                          <h3 className="text-xs uppercase tracking-wider font-bold">Key Standouts</h3>
                        </div>
                        
                        {/* Pole Position */}
                        <div className="bg-gradient-to-br from-primary/15 to-transparent rounded-xl p-5 border border-primary/30 hover:border-primary/50 transition-all hover:shadow-md hover:shadow-primary/20">
                          <p className="text-xs uppercase tracking-widest font-bold text-primary/70 mb-2">🎯 Pole Position</p>
                          <p className="font-bold text-lg text-foreground">{getDriverName(result.pole)}</p>
                        </div>

                        {/* Best Constructor */}
                        <div className="bg-gradient-to-br from-f1-success/15 to-transparent rounded-xl p-5 border border-f1-success/30 hover:border-f1-success/50 transition-all hover:shadow-md hover:shadow-f1-success/20">
                          <p className="text-xs uppercase tracking-widest font-bold text-f1-success/70 mb-2">🏁 Best Scoring Constructor</p>
                          <p className="font-bold text-lg text-f1-success">{result.bestConstructor || "TBC"}</p>
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
