import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import {
  getRaceById,
  isRaceLocked,
  isSprintLocked,
} from "@/lib/data/raceCalendar";
import { Badge } from "@/components/ui/badge";
import { Zap, Lock } from "lucide-react";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import PredictionForm from "@/components/prediction/PredictionForm";

const Predict = () => {
  const { raceId, type = "race" } = useParams<{
    raceId: string;
    type: string;
  }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const predictionType = type === "sprint" ? "sprint" : "race";
  const race = raceId ? getRaceById(raceId) : null;

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  // Redirect if trying to access sprint for non-sprint weekend
  useEffect(() => {
    if (race && predictionType === "sprint" && !race.sprintWeekend) {
      navigate(`/predict/${raceId}/race`, { replace: true });
    }
  }, [race, predictionType, raceId, navigate]);

  if (!race) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container pt-24 text-center">
          <p className="text-muted-foreground">Race not found</p>
        </main>
      </div>
    );
  }

  const isSprint = predictionType === "sprint";
  const locked = isSprint ? isSprintLocked(race) : isRaceLocked(race);
  const lockDeadline = isSprint
    ? race.sprintQualifyingStartTime!
    : race.qualifyingStartTime;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12 max-w-2xl">
        {/* Race header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{race.countryFlag}</span>
            <div>
              <h1 className="f1-heading text-2xl">{race.raceName}</h1>
              <p className="text-sm text-muted-foreground">
                {race.circuitName}
              </p>
            </div>
          </div>

          {/* Type selector for sprint weekends */}
          {race.sprintWeekend && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate(`/predict/${raceId}/sprint`)}
                className={`px-4 py-2 rounded-lg text-sm f1-heading transition-all ${
                  isSprint
                    ? "bg-f1-warning/20 text-f1-warning border border-f1-warning/50"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                <Zap className="h-3 w-3 inline mr-1.5" />
                Sprint · 0.5× pts
              </button>
              <button
                onClick={() => navigate(`/predict/${raceId}/race`)}
                className={`px-4 py-2 rounded-lg text-sm f1-heading transition-all ${
                  !isSprint
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                Grand Prix
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3">
            {isSprint && (
              <Badge
                variant="outline"
                className="border-f1-warning/50 text-f1-warning text-xs gap-1"
              >
                <Zap className="h-3 w-3" />
                Sprint · 0.5× Points
              </Badge>
            )}
            {locked ? (
              <Badge className="bg-primary/20 text-primary gap-1">
                <Lock className="h-3 w-3" />
                Predictions Locked
              </Badge>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Locks in{" "}
                <CountdownTimer
                  targetDate={lockDeadline}
                  className="text-base"
                />
              </div>
            )}
          </div>
        </div>

        <PredictionForm race={race} type={predictionType} locked={locked} />
      </main>
    </div>
  );
};

export default Predict;
