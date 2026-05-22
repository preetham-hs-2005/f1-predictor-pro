import { useEffect, useState } from "react";
import { AlertTriangle, Loader, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDrivers } from "@/hooks/useDrivers";
import { apiClient, type ApiResponse } from "@/lib/api/client";
import { type LeaderboardEntry } from "@/lib/api/leaderboard";
import { getUserScores, type Prediction, type UserScore } from "@/lib/api/predictions";
import { getAllRaces } from "@/lib/api/races";
import {
  isPredictionDisqualified,
  isPredictionLocked,
  type PredictionType,
  type RaceWeekend,
} from "@/lib/data/raceCalendar";
import { cn } from "@/lib/utils";

interface UserPredictionsDialogProps {
  user: LeaderboardEntry | null;
  onClose: () => void;
}

const scorePart = (label: string, value?: number) =>
  value && value > 0 ? (
    <span className="border border-signal/30 bg-signal/10 px-2 py-1 data-mono text-[10px] text-signal">
      {label} +{value}
    </span>
  ) : null;

const maskEmail = (email?: string) => {
  if (!email) return "";
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 2).toUpperCase() || "**"}***@${domain.toUpperCase()}`;
};

export function UserPredictionsDialog({ user, onClose }: UserPredictionsDialogProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [scores, setScores] = useState<UserScore[]>([]);
  const [races, setRaces] = useState<RaceWeekend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { drivers } = useDrivers();

  const getDriverName = (id?: string) => {
    if (!id) return "-";
    const driver = drivers.find((d) => d.id === id);
    return driver ? driver.name : id;
  };

  useEffect(() => {
    if (!user) return;

    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const serverRaces = await getAllRaces();
        const convertedRaces = serverRaces.map((race) => ({
          id: race.raceId,
          raceName: race.raceName,
          circuitName: race.circuitName,
          country: race.country || "",
          countryFlag: race.countryFlag,
          round: race.round,
          qualifyingStartTime: race.qualifyingStartTime,
          raceStartTime: race.raceStartTime,
          sprintWeekend: race.sprintWeekend,
          sprintQualifyingStartTime: race.sprintQualifyingStartTime,
          sprintStartTime: race.sprintStartTime,
          timeZone: race.timeZone,
          isLocked: race.isLocked || false,
          isComplete: race.isComplete || false,
          cancelled: race.cancelled || false,
        }));
        setRaces(convertedRaces);

        const lockedIds = convertedRaces
          .filter((race) => isPredictionLocked(race, "race") || isPredictionLocked(race, "sprint"))
          .map((race) => race.id)
          .join(",");

        const res = await apiClient.get<ApiResponse<Prediction[]>>(`/api/predictions/public/${user.userId}?lockedIds=${lockedIds}`);
        if (res.success && res.data) {
          setPredictions(res.data);
        } else {
          setError(res.error || "Failed to load predictions");
        }

        setScores(await getUserScores(user.userId));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load predictions");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [user]);

  const getRace = (raceId: string) => races.find((race) => race.id === raceId);
  const getScoreForPrediction = (raceId: string, type: string) => scores.find((score) => score.raceId === raceId && score.type === type);
  const scoredTotal = scores.reduce((sum, score) => sum + score.total, 0);

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:h-[88vh] sm:w-[calc(100vw-2rem)] sm:max-w-6xl sm:rounded-sm">
        <DialogHeader className="border-b border-border px-4 py-3 pr-12 sm:px-5 sm:py-4">
          <DialogTitle className="display truncate text-xl font-bold text-white sm:text-2xl">
            {user?.username || user?.name || "Player"} / prediction trace
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[300px_1fr] lg:overflow-hidden">
          <aside className="shrink-0 border-b border-border bg-sidebar/70 p-4 lg:border-b-0 lg:border-r lg:p-5">
            <div className="flex items-start gap-3 lg:block">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-signal bg-signal/10 text-signal lg:mt-5 lg:h-20 lg:w-20">
                <Trophy className="h-6 w-6 lg:h-9 lg:w-9" />
              </div>
              <div className="min-w-0 lg:mt-5">
                <p className="label-eyebrow">Driver profile</p>
                <p className="display mt-1 truncate text-2xl font-bold text-white lg:text-3xl">{user?.username || user?.name}</p>
                <p className="data-mono mt-1 truncate text-[10px] uppercase text-muted-foreground">{maskEmail(user?.email)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 lg:mt-6 lg:grid-cols-2">
              {[
                ["Rank", user ? `P${user.rank}` : "-"],
                ["Total", user?.totalPoints ?? 0],
                ["Scored", scoredTotal],
                ["Entries", user?.predictionsSubmitted ?? 0],
                ["Winner hits", user?.correctWinners ?? 0],
                ["Exact pods", user?.exactPodiums ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 border border-border bg-surface-2 p-2 lg:p-3">
                  <p className="label-eyebrow">{label}</p>
                  <p className="data-mono mt-1 truncate text-lg font-bold text-white lg:mt-2 lg:text-xl">{value}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="min-h-0 lg:overflow-y-auto">
            {loading ? (
              <div className="flex h-full min-h-[360px] items-center justify-center">
                <Loader className="h-7 w-7 animate-spin text-signal" />
              </div>
            ) : error ? (
              <div className="m-5 border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
            ) : predictions.length === 0 ? (
              <div className="flex h-full min-h-[360px] items-center justify-center p-8 text-center">
                <p className="data-mono text-sm text-muted-foreground">No locked predictions found for this user.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {predictions.map((prediction) => {
                  const score = getScoreForPrediction(prediction.raceWeekendId, prediction.type);
                  const race = getRace(prediction.raceWeekendId);
                  const predictionType: PredictionType = prediction.type === "sprint" ? "sprint" : "race";
                  const disqualified = race ? isPredictionDisqualified(race, prediction, predictionType) : false;
                  return (
                    <article key={`${prediction.raceWeekendId}-${prediction.type}`} className="grid gap-4 px-4 py-4 sm:px-5 xl:grid-cols-[minmax(180px,1fr)_1.35fr_140px] xl:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={cn(prediction.type === "sprint" ? "border-warning/30 bg-warning/10 text-warning" : "border-signal/30 bg-signal/10 text-signal")}>
                            {prediction.type}
                          </Badge>
                          {disqualified && (
                            <Badge variant="outline" className="border-destructive/40 bg-destructive/15 text-destructive">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              DSQ
                            </Badge>
                          )}
                        </div>
                        <p className="display mt-3 truncate text-xl font-bold text-white sm:text-2xl">{race?.raceName || prediction.raceWeekendId}</p>
                        <p className="data-mono mt-1 truncate text-[10px] uppercase text-muted-foreground">
                          {race ? `R${race.round} / ${race.circuitName}` : prediction.raceWeekendId}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="border border-border bg-surface-2/50 p-3">
                          <p className="label-eyebrow">Podium call</p>
                          {[
                            ["P1", prediction.predictedP1, score?.p1Points],
                            ["P2", prediction.predictedP2, score?.p2Points],
                            ["P3", prediction.predictedP3, score?.p3Points],
                          ].map(([label, driver, points]) => (
                            <div key={label as string} className="mt-2 grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3 data-mono text-sm">
                              <span className="text-muted-foreground">{label}</span>
                              <span className={cn("truncate text-right font-semibold text-white", Number(points) > 0 && "text-signal")}>{getDriverName(driver as string)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border border-border bg-surface-2/50 p-3">
                          <p className="label-eyebrow">Bonus board</p>
                          <div className="mt-2 grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3 data-mono text-sm">
                            <span className="text-muted-foreground">Pole</span>
                            <span className={cn("truncate text-right font-semibold text-white", score?.polePoints && "text-signal")}>{getDriverName(prediction.predictedPole)}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3 data-mono text-sm">
                            <span className="text-muted-foreground">Constructor</span>
                            <span className={cn("truncate text-right font-semibold text-white", score?.constructorPoints && "text-signal")}>{prediction.predictedConstructor || "-"}</span>
                          </div>
                        </div>
                        {prediction.unexpectedStatement && (
                          <div className="border border-warning/20 bg-warning/10 p-3 md:col-span-2">
                            <p className="label-eyebrow text-warning">Unexpected pick</p>
                            <p className="mt-2 text-sm leading-6 text-white/80">{prediction.unexpectedStatement}</p>
                          </div>
                        )}
                      </div>

                      <div className="border border-border bg-surface-2/50 p-3">
                        <p className="label-eyebrow">Score</p>
                        <p className="data-mono mt-2 text-3xl font-bold text-white">{score?.total ?? 0}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {scorePart("P1", score?.p1Points)}
                          {scorePart("P2", score?.p2Points)}
                          {scorePart("P3", score?.p3Points)}
                          {scorePart("Pole", score?.polePoints)}
                          {scorePart("Pod", score?.podiumBonusPoints)}
                          {scorePart("Ctor", score?.constructorPoints)}
                          {scorePart("Wild", score?.unexpectedPoints)}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
