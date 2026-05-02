import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, Lock, Timer, Zap, X } from "lucide-react";

import { type RaceWeekend, isRaceLocked, isSprintLocked } from "@/lib/data/raceCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./CountdownTimer";
import { cn } from "@/lib/utils";

interface RaceCardProps {
  race: RaceWeekend;
  featured?: boolean;
}

const formatSessionTime = (dateStr: string, timeZone: string) => {
  const d = new Date(dateStr);

  const local = d.toLocaleTimeString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });

  const ist = d.toLocaleTimeString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return { local, ist };
};

const RaceCard = ({ race, featured = false }: RaceCardProps) => {
  const raceLocked = isRaceLocked(race);
  const sprintLocked = race.sprintWeekend ? isSprintLocked(race) : true;

  const now = new Date();
  const isBeforeQuali = now < new Date(race.qualifyingStartTime);
  const isBeforeRace = now < new Date(race.raceStartTime);

  let nextSessionName = "Race";
  let nextSessionDate = race.raceStartTime;

  if (isBeforeQuali) {
    nextSessionName = "Qualifying";
    nextSessionDate = race.qualifyingStartTime;
  } else if (isBeforeRace) {
    nextSessionName = "Race";
    nextSessionDate = race.raceStartTime;
  }

  const getStatus = () => {
    if (race.cancelled) {
      return {
        label: "Cancelled",
        className: "border-destructive/30 bg-destructive/10 text-destructive",
        icon: X,
      };
    }
    if (race.isComplete) {
      return {
        label: "Complete",
        className: "border-border bg-surface-2 text-muted-foreground",
        icon: CheckCircle2,
      };
    }
    if (raceLocked) {
      return {
        label: "Locked",
        className: "border-warning/30 bg-warning/10 text-warning",
        icon: Lock,
      };
    }
    return {
      label: "Open",
      className: "border-signal/40 bg-signal/10 text-signal",
      icon: Timer,
    };
  };

  const status = getStatus();

  return (
    <article className={cn("panel panel-corners h-full overflow-hidden transition-colors hover:border-signal/50", featured && "signal-glow")}>
      <div className="grid h-full grid-rows-[auto_1fr_auto]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="data-mono text-lg font-bold text-muted-foreground">R{race.round}</span>
            <span className="text-3xl leading-none">{race.countryFlag}</span>
            <div className="min-w-0">
              <h3 className={cn("display truncate font-bold text-white", featured ? "text-xl" : "text-lg")}>{race.raceName}</h3>
              <p className="data-mono truncate text-[10px] uppercase text-muted-foreground">{race.circuitName}</p>
            </div>
          </div>
          <Badge className={cn("data-mono rounded-sm border px-2.5 py-1 text-[10px] font-bold uppercase", status.className)}>
            <status.icon className="mr-1.5 h-3 w-3" />
            {status.label}
          </Badge>
        </div>

        <div className="divide-y divide-border">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-4">
              <p className="label-eyebrow">Qualifying</p>
              <p className="data-mono mt-2 text-sm text-white">{formatSessionTime(race.qualifyingStartTime, race.timeZone).local}</p>
              <p className="data-mono mt-1 text-[10px] text-signal">{formatSessionTime(race.qualifyingStartTime, race.timeZone).ist} IST</p>
            </div>
            <div className="p-4">
              <p className="label-eyebrow">Race</p>
              <p className="data-mono mt-2 text-sm text-white">{formatSessionTime(race.raceStartTime, race.timeZone).local}</p>
              <p className="data-mono mt-1 text-[10px] text-signal">{formatSessionTime(race.raceStartTime, race.timeZone).ist} IST</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 bg-surface-2/45 px-4 py-3">
            <div>
              <p className="label-eyebrow">Next session</p>
              <p className="mt-1 text-sm font-semibold text-white">{nextSessionName}</p>
            </div>
            <div className="text-right">
              <p className="label-eyebrow">Countdown</p>
              {!race.isComplete && nextSessionDate ? (
                <CountdownTimer targetDate={nextSessionDate} className="data-mono mt-1 text-base font-bold text-white" />
              ) : (
                <span className="data-mono mt-1 block text-sm font-medium text-muted-foreground">Complete</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="data-mono rounded-sm border-border bg-surface-2 text-[10px] uppercase text-muted-foreground">
              <CalendarClock className="mr-1.5 h-3 w-3" />
              {new Date(race.raceStartTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Badge>
            {race.sprintWeekend && (
              <Badge variant="outline" className="data-mono rounded-sm border-warning/30 bg-warning/10 text-[10px] uppercase text-warning">
                <Zap className="mr-1.5 h-3 w-3" />
                Sprint
              </Badge>
            )}
          </div>

          {!race.isComplete && !race.cancelled && (
            <div className="flex flex-wrap gap-2">
              {race.sprintWeekend && !sprintLocked && (
                <Link to={`/predict/${race.id}/sprint`} className="min-w-[140px] flex-1">
                  <Button className="w-full" variant="cockpit">
                    <Zap className="h-4 w-4" />
                    Sprint pick
                  </Button>
                </Link>
              )}
              {!raceLocked && (
                <Link to={`/predict/${race.id}/race`} className="min-w-[140px] flex-1">
                  <Button className="w-full" variant="signal">
                    {race.sprintWeekend ? "Grand Prix" : "Predict"}
                  </Button>
                </Link>
              )}
              {raceLocked && (
                <Button className="w-full" variant="cockpit" disabled>
                  <Lock className="h-4 w-4" />
                  Closed
                </Button>
              )}
            </div>
          )}

          {race.sprintWeekend && !sprintLocked && !race.isComplete && race.sprintQualifyingStartTime && (
            <div className="mt-3 flex items-center justify-between border border-warning/25 bg-warning/10 px-3 py-2 data-mono text-[10px] text-warning">
              <span className="flex items-center gap-2 font-semibold">
                <Zap className="h-3.5 w-3.5" />
                Sprint closes
              </span>
              <CountdownTimer targetDate={race.sprintQualifyingStartTime} className="text-xs font-bold text-warning" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default RaceCard;
