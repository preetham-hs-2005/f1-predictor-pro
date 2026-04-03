import { Link } from "react-router-dom";
import { CheckCircle2, Lock, Timer, Zap, X } from "lucide-react";

import { type RaceWeekend, isRaceLocked, isSprintLocked } from "@/lib/data/raceCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./CountdownTimer";

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
        className: "bg-destructive/15 text-destructive border-destructive/20",
        icon: X,
      };
    }
    if (race.isComplete) {
      return {
        label: "Completed",
        className: "bg-white/[0.08] text-white/70 border-white/10",
        icon: CheckCircle2,
      };
    }
    if (raceLocked) {
      return {
        label: "Locked",
        className: "bg-primary/15 text-primary border-primary/20",
        icon: Lock,
      };
    }
    return {
      label: "Open",
      className: "bg-emerald-400/12 text-emerald-300 border-emerald-400/20",
      icon: Timer,
    };
  };

  const status = getStatus();

  return (
    <div
      className={[
        "section-card h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/15",
        featured ? "glow-red" : "",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {race.countryFlag}
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">Round {race.round}</p>
              <h3 className={`font-heading ${featured ? "text-xl" : "text-lg"} mt-1 text-white`}>{race.raceName}</h3>
              <p className="text-sm text-white/55">{race.circuitName}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] ${status.className}`}>
              <status.icon className="mr-1.5 h-3 w-3" />
              {status.label}
            </Badge>
            {race.sprintWeekend && (
              <Badge variant="outline" className="rounded-full border-f1-warning/30 bg-f1-warning/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-f1-warning">
                <Zap className="mr-1.5 h-3 w-3" />
                Sprint
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="panel-subtle">
            <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/40">Qualifying</p>
            <p className="mt-3 text-sm text-white/85">{formatSessionTime(race.qualifyingStartTime, race.timeZone).local}</p>
            <p className="mt-1 text-xs text-primary">{formatSessionTime(race.qualifyingStartTime, race.timeZone).ist} IST</p>
          </div>
          <div className="panel-subtle">
            <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/40">Race</p>
            <p className="mt-3 text-sm text-white/85">{formatSessionTime(race.raceStartTime, race.timeZone).local}</p>
            <p className="mt-1 text-xs text-primary">{formatSessionTime(race.raceStartTime, race.timeZone).ist} IST</p>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/40">Next window</p>
            <p className="mt-2 text-sm text-white/70">{nextSessionName}</p>
          </div>
          <div className="text-right">
            <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/40">Countdown</p>
            {!race.isComplete && nextSessionDate ? (
              <CountdownTimer targetDate={nextSessionDate} className="mt-2 text-xl font-heading text-white" />
            ) : (
              <span className="mt-2 block text-sm font-medium text-white/65">Completed</span>
            )}
          </div>
        </div>

        {!race.isComplete && !race.cancelled && (
          <div className="mt-6 flex flex-wrap gap-3">
            {race.sprintWeekend && !sprintLocked && (
              <Link to={`/predict/${race.id}/sprint`} className="flex-1 min-w-[150px]">
                <Button className="w-full" variant="outline">
                  <Zap className="h-4 w-4" />
                  Sprint Pick
                </Button>
              </Link>
            )}
            {!raceLocked && (
              <Link
                to={`/predict/${race.id}/race`}
                className={race.sprintWeekend && !sprintLocked ? "flex-1 min-w-[150px]" : "w-full"}
              >
                <Button className="w-full">
                  {race.sprintWeekend ? "Grand Prix Pick" : "Make Prediction"}
                </Button>
              </Link>
            )}
          </div>
        )}

        {race.sprintWeekend && !sprintLocked && !race.isComplete && race.sprintQualifyingStartTime && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-f1-warning/20 bg-f1-warning/10 px-4 py-3 text-xs text-f1-warning">
            <span className="flex items-center gap-2 uppercase tracking-[0.2em]">
              <Zap className="h-3.5 w-3.5" />
              Sprint closes
            </span>
            <CountdownTimer targetDate={race.sprintQualifyingStartTime} className="text-sm font-heading text-f1-warning" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceCard;
