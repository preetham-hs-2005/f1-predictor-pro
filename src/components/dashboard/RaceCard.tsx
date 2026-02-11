import { Link } from "react-router-dom";
import {
  type RaceWeekend,
  isRaceLocked,
  isSprintLocked,
} from "@/lib/data/raceCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./CountdownTimer";
import { Zap, Lock, CheckCircle2, Timer } from "lucide-react";

interface RaceCardProps {
  race: RaceWeekend;
  featured?: boolean;
}

const RaceCard = ({ race, featured = false }: RaceCardProps) => {
  const raceLocked = isRaceLocked(race);
  const sprintLocked = race.sprintWeekend ? isSprintLocked(race) : true;
  const raceDate = new Date(race.raceStartTime);

  const getStatus = () => {
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

        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Race Day</p>
            <p className="text-sm font-medium">
              {raceDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">
              {raceLocked ? "Status" : "Race locks in"}
            </p>
            {raceLocked ? (
              <Badge className={status.color + " text-xs"}>
                <status.icon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            ) : (
              <CountdownTimer
                targetDate={race.qualifyingStartTime}
                className="text-lg"
              />
            )}
          </div>
        </div>

        {/* Prediction buttons */}
        {!race.isComplete && (
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
