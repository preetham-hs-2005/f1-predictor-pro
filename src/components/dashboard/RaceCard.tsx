import { Link } from "react-router-dom";
import {
  type RaceWeekend,
  isRaceLocked,
  isSprintLocked,
} from "@/lib/data/raceCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./CountdownTimer";
import { Zap, Lock, CheckCircle2, Timer, X } from "lucide-react";

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

  // Determine which session is next
  let nextSessionName = "Race";
  let nextSessionDate = race.raceStartTime;
  
  if (isBeforeQuali) {
    nextSessionName = "Quali";
    nextSessionDate = race.qualifyingStartTime;
  } else if (isBeforeRace) {
    nextSessionName = "Race";
    nextSessionDate = race.raceStartTime;
  }

  const getStatus = () => {
    if (race.cancelled)
      return {
        label: "Cancelled",
        color: "bg-destructive/20 text-destructive",
        icon: X,
      };
    if (race.isComplete)
      return {
        label: "Completed",
        color: "bg-muted text-muted-foreground",
        icon: CheckCircle2,
      };
    if (raceLocked)
      return {
        label: "Locked",
        color: "bg-primary/20 text-primary",
        icon: Lock,
      };
    return {
      label: "Open",
      color: "bg-f1-success/20 text-f1-success",
      icon: Timer,
    };
  };

  const status = getStatus();

  return (
    <div
      className={`glass rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30 ${
        featured ? "hover:glow-red" : ""
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{race.countryFlag}</span>
            <div>
              <h3
                className={`f1-heading ${featured ? "text-base" : "text-sm"}`}
              >
                {race.raceName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {race.circuitName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {race.sprintWeekend && (
              <Badge
                variant="outline"
                className="border-f1-warning/50 text-f1-warning text-xs gap-1"
              >
                <Zap className="h-3 w-3" />
                Sprint
              </Badge>
            )}
          </div>
        </div>

        {/* Schedule Information */}
        <div className="mt-4 space-y-2 p-3 bg-black/20 rounded-lg border border-white/10 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground">Quali:</span>
            <div className="text-right flex items-center gap-1.5">
              <span>{formatSessionTime(race.qualifyingStartTime, race.timeZone).local}</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="text-f1-orange font-medium">{formatSessionTime(race.qualifyingStartTime, race.timeZone).ist} IST</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted-foreground">Race:</span>
            <div className="text-right flex items-center gap-1.5">
              <span>{formatSessionTime(race.raceStartTime, race.timeZone).local}</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="text-f1-orange font-medium">{formatSessionTime(race.raceStartTime, race.timeZone).ist} IST</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Prediction Status</p>
            <Badge className={status.color + " text-[10px]"}>
              <status.icon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">
              {nextSessionName} in
            </p>
            {!race.isComplete && nextSessionDate ? (
              <CountdownTimer
                targetDate={nextSessionDate}
                className="text-lg"
              />
            ) : (
              <span className="text-sm font-medium">Completed</span>
            )}
          </div>
        </div>

        {/* Prediction buttons */}
        {!race.isComplete && !race.cancelled && (
          <div className="flex gap-2 mt-4">
            {/* Sprint prediction button for sprint weekends */}
            {race.sprintWeekend && !sprintLocked && (
              <Link
                to={`/predict/${race.id}/sprint`}
                className="block flex-1"
              >
                <Button
                  className="w-full border-f1-warning/50 text-f1-warning hover:bg-f1-warning/10"
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Sprint
                </Button>
              </Link>
            )}

            {/* Race prediction button */}
            {!raceLocked && (
              <Link
                to={`/predict/${race.id}/race`}
                className={`block ${race.sprintWeekend && !sprintLocked ? "flex-1" : "w-full"}`}
              >
                <Button className="w-full" size="sm">
                  {race.sprintWeekend ? "Grand Prix" : "Make Prediction"}
                </Button>
              </Link>
            )}

            {/* Show sprint countdown if sprint is open but race is locked */}
            {race.sprintWeekend &&
              sprintLocked &&
              !raceLocked &&
              race.sprintQualifyingStartTime && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Lock className="h-3 w-3 mr-1 text-f1-warning" />
                  Sprint locked
                </div>
              )}
          </div>
        )}

        {/* Sprint countdown when sprint is still open */}
        {race.sprintWeekend &&
          !sprintLocked &&
          !race.isComplete &&
          race.sprintQualifyingStartTime && (
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-f1-warning" />
                Sprint locks in
              </span>
              <CountdownTimer
                targetDate={race.sprintQualifyingStartTime}
                className="text-sm text-f1-warning"
              />
            </div>
          )}
      </div>
      <div className="h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
    </div>
  );
};

export default RaceCard;
