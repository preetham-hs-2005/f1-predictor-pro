import { useState } from "react";
import { raceCalendar } from "@/lib/data/raceCalendar";
import { drivers } from "@/lib/data/drivers";
import { getResult, saveResult, scoreRace } from "@/lib/data/results";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, Zap } from "lucide-react";

const AdminResults = () => {
  const [selectedRace, setSelectedRace] = useState("");
  const [resultType, setResultType] = useState<"race" | "sprint">("race");

  const race = raceCalendar.find((r) => r.id === selectedRace);
  const existingResult = selectedRace ? getResult(selectedRace, resultType) : null;

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [pole, setPole] = useState("");

  const loadExisting = (raceId: string, type: "race" | "sprint") => {
    const result = getResult(raceId, type);
    if (result) {
      setP1(result.p1);
      setP2(result.p2);
      setP3(result.p3);
      setPole(result.pole);
    } else {
      setP1("");
      setP2("");
      setP3("");
      setPole("");
    }
  };

  const handleRaceChange = (id: string) => {
    setSelectedRace(id);
    setResultType("race");
    loadExisting(id, "race");
  };

  const handleTypeChange = (type: "race" | "sprint") => {
    setResultType(type);
    loadExisting(selectedRace, type);
  };

  const handleSubmit = () => {
    if (!p1 || !p2 || !p3 || !pole) {
      toast.error("All positions must be filled");
      return;
    }
    const podium = [p1, p2, p3];
    if (new Set(podium).size !== 3) {
      toast.error("Each podium position must be a different driver");
      return;
    }

    const result = { raceId: selectedRace, type: resultType, p1, p2, p3, pole };
    saveResult(result);
    scoreRace(result);
    toast.success(`${resultType === "sprint" ? "Sprint" : "Race"} results saved & predictions scored!`);
  };

  const completedResults = raceCalendar
    .map((r) => ({
      race: r,
      hasRace: !!getResult(r.id, "race"),
      hasSprint: r.sprintWeekend ? !!getResult(r.id, "sprint") : null,
    }))
    .filter((r) => r.hasRace || r.hasSprint);

  return (
    <div className="space-y-6">
      {/* Race selector */}
      <section className="glass rounded-xl p-6">
        <h2 className="f1-heading text-sm text-muted-foreground mb-4">Enter Race Results</h2>
        <Select value={selectedRace} onValueChange={handleRaceChange}>
          <SelectTrigger className="bg-background/50 mb-4">
            <SelectValue placeholder="Select a race" />
          </SelectTrigger>
          <SelectContent>
            {raceCalendar.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.countryFlag} R{r.round} · {r.raceName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {race && (
          <>
            {/* Type selector for sprint weekends */}
            {race.sprintWeekend && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleTypeChange("race")}
                  className={`px-4 py-2 rounded-lg text-sm f1-heading transition-all ${
                    resultType === "race"
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Grand Prix
                </button>
                <button
                  onClick={() => handleTypeChange("sprint")}
                  className={`px-4 py-2 rounded-lg text-sm f1-heading transition-all ${
                    resultType === "sprint"
                      ? "bg-f1-warning/20 text-f1-warning border border-f1-warning/50"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Zap className="h-3 w-3 inline mr-1" />
                  Sprint
                </button>
              </div>
            )}

            {/* Position selectors */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: "P1 - Winner", value: p1, setter: setP1, exclude: [p2, p3] },
                { label: "P2 - Second", value: p2, setter: setP2, exclude: [p1, p3] },
                { label: "P3 - Third", value: p3, setter: setP3, exclude: [p1, p2] },
                { label: "Pole Position", value: pole, setter: setPole, exclude: [] },
              ].map((pos) => (
                <div key={pos.label}>
                  <label className="text-xs text-muted-foreground mb-1 block">{pos.label}</label>
                  <Select value={pos.value} onValueChange={pos.setter}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers
                        .filter((d) => !pos.exclude.includes(d.id))
                        .map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: d.teamColor }}
                              />
                              #{d.number} {d.name}
                            </span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Save Results & Score Predictions
            </Button>
          </>
        )}
      </section>

      {/* Completed results summary */}
      {completedResults.length > 0 && (
        <section className="glass rounded-xl p-6">
          <h2 className="f1-heading text-sm text-muted-foreground mb-4">Completed Races</h2>
          <div className="space-y-2">
            {completedResults.map(({ race: r, hasRace, hasSprint }) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/30"
              >
                <div className="flex items-center gap-2">
                  <span>{r.countryFlag}</span>
                  <span className="text-sm font-semibold">{r.raceName}</span>
                </div>
                <div className="flex gap-2">
                  {hasRace && (
                    <Badge variant="outline" className="text-f1-success border-f1-success/50 gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Race
                    </Badge>
                  )}
                  {hasSprint && (
                    <Badge variant="outline" className="text-f1-warning border-f1-warning/50 gap-1">
                      <Zap className="h-3 w-3" />
                      Sprint
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminResults;
