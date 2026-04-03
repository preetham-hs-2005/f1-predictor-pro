import { useEffect } from "react";
import { Lock, X, Zap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import PredictionForm from "@/components/prediction/PredictionForm";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getRaceById, isRaceLocked, isSprintLocked } from "@/lib/data/raceCalendar";

const Predict = () => {
  const { raceId, type = "race" } = useParams<{ raceId: string; type: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const predictionType = type === "sprint" ? "sprint" : "race";
  const race = raceId ? getRaceById(raceId) : null;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate, isLoading]);

  useEffect(() => {
    if (race && predictionType === "sprint" && !race.sprintWeekend) {
      navigate(`/predict/${raceId}/race`, { replace: true });
    }
  }, [race, predictionType, raceId, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!race) {
    return (
      <PageShell>
        <Navbar />
        <main className="container pt-28 md:pt-32">
          <section className="section-card text-center">
            <p className="font-heading text-2xl text-white">Race not found</p>
          </section>
        </main>
      </PageShell>
    );
  }

  const isSprint = predictionType === "sprint";
  const locked = isSprint ? isSprintLocked(race) : isRaceLocked(race);
  const lockDeadline = isSprint ? race.sprintQualifyingStartTime! : race.qualifyingStartTime;

  return (
    <PageShell>
      <Navbar />
      <main className="container pb-12 pt-28 md:pt-32">
        <PageHeader
          eyebrow={`Round ${race.round}`}
          title={race.raceName}
          description={`${race.circuitName} • Build your ${isSprint ? "sprint" : "grand prix"} prediction without leaving the race context.`}
          badge={isSprint ? "Sprint mode" : "Race mode"}
          stats={[
            { label: "Event", value: race.countryFlag },
            { label: "Type", value: isSprint ? "Sprint" : "Grand Prix" },
            { label: "Deadline", value: locked ? "Locked" : "Open" },
            { label: "Timezone", value: "IST ready" },
          ]}
        />

        <section className="section-card mt-8">
          {race.sprintWeekend && (
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/predict/${raceId}/sprint`)}
                className={`rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all ${
                  isSprint
                    ? "border-f1-warning/30 bg-f1-warning/10 text-f1-warning"
                    : "border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
                }`}
              >
                <Zap className="mr-2 inline h-4 w-4" />
                Sprint
              </button>
              <button
                onClick={() => navigate(`/predict/${raceId}/race`)}
                className={`rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all ${
                  !isSprint
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
                }`}
              >
                Grand Prix
              </button>
            </div>
          )}

          <div className="mb-8 flex flex-wrap items-center gap-3">
            {isSprint && (
              <Badge variant="outline" className="rounded-full border-f1-warning/30 bg-f1-warning/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-f1-warning">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Sprint • 0.5x points
              </Badge>
            )}
            {race.cancelled ? (
              <Badge className="rounded-full border border-destructive/25 bg-destructive/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-destructive">
                <X className="mr-1.5 h-3.5 w-3.5" />
                Race cancelled
              </Badge>
            ) : locked ? (
              <Badge className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-primary">
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Predictions locked
              </Badge>
            ) : (
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
                Locks in <CountdownTimer targetDate={lockDeadline} className="ml-2 inline font-heading text-white" />
              </div>
            )}
          </div>

          {race.cancelled ? (
            <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-6 text-center">
              <p className="text-destructive font-medium">This race has been cancelled. Predictions are not available.</p>
            </div>
          ) : (
            <PredictionForm race={race} type={predictionType} locked={locked} />
          )}
        </section>
      </main>
    </PageShell>
  );
};

export default Predict;
