import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import RaceCard from "@/components/dashboard/RaceCard";
import { getUpcomingRaces } from "@/lib/data/raceCalendar";
import { raceCalendar } from "@/lib/data/raceCalendar";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const upcoming = getUpcomingRaces();
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
