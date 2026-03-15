import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import RaceCard from "@/components/dashboard/RaceCard";
import { getUpcomingRacesFromServer } from "@/lib/api/races";
import { type RaceWeekend } from "@/lib/data/raceCalendar";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<RaceWeekend[]>([]);
  const [racesLoading, setRacesLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = async () => {
    setRacesLoading(true);
    try {
      const serverRaces = await getUpcomingRacesFromServer();
      // Convert ServerRace to RaceWeekend format
      const converted: RaceWeekend[] = serverRaces.map((race) => ({
        id: race.raceId,
        raceName: race.raceName,
        circuitName: race.circuitName,
        country: "",
        countryFlag: race.countryFlag,
        round: race.round,
        qualifyingStartTime: race.qualifyingStartTime,
        raceStartTime: race.raceStartTime,
        sprintWeekend: race.sprintWeekend,
        sprintQualifyingStartTime: race.sprintQualifyingStartTime,
        timeZone: race.timeZone,
        isLocked: false,
        isComplete: false,
        cancelled: race.cancelled,
        officialResults: null,
      }));
      setUpcoming(converted);
    } catch (error) {
      console.error("Failed to load races:", error);
    } finally {
      setRacesLoading(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const featured = upcoming.slice(0, 3);
  const rest = upcoming.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="f1-heading text-3xl mb-2">Race Calendar</h1>
          <p className="text-muted-foreground text-sm">
            {upcoming.length} races remaining in the 2026 season
          </p>
        </div>

        {/* Featured upcoming races */}
        <section className="mb-12">
          <h2 className="f1-heading text-sm text-muted-foreground mb-4">Up Next</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((race, i) => (
              <div key={race.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <RaceCard race={race} featured />
              </div>
            ))}
          </div>
        </section>

        {/* Full schedule */}
        {rest.length > 0 && (
          <section>
            <h2 className="f1-heading text-sm text-muted-foreground mb-4">
              Full Schedule
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rest.map((race) => (
                <div key={race.id} className="glass rounded-lg p-4 flex items-center justify-between gap-3 transition-all hover:border-primary/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{race.countryFlag}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{race.raceName}</p>
                      <p className="text-xs text-muted-foreground">
                        R{race.round} ·{" "}
                        {new Date(race.raceStartTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {race.sprintWeekend && (
                    <Badge variant="outline" className="border-f1-warning/40 text-f1-warning text-[10px] shrink-0">
                      <Zap className="h-2.5 w-2.5" />
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
