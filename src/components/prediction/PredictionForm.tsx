import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, CheckCircle2, ChevronsUpDown, Loader2, Lock, Trophy } from "lucide-react";
import { toast } from "sonner";

import { CockpitPanel } from "@/components/layout/CockpitPanel";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useDrivers } from "@/hooks/useDrivers";
import { type Driver } from "@/lib/api/drivers";
import { getUserPrediction, submitPrediction } from "@/lib/api/predictions";
import { type RaceWeekend } from "@/lib/data/raceCalendar";
import { cn } from "@/lib/utils";

interface PredictionFormProps {
  race: RaceWeekend;
  type: "sprint" | "race";
  locked: boolean;
}

const slots = [
  { key: "p1", label: "P1", points: 25 },
  { key: "p2", label: "P2", points: 20 },
  { key: "p3", label: "P3", points: 15 },
] as const;

interface DriverComboboxProps {
  drivers: Driver[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const DriverCombobox = ({ drivers, value, onValueChange, placeholder, disabled }: DriverComboboxProps) => {
  const [open, setOpen] = useState(false);
  const selectedDriver = drivers.find((driver) => driver.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-11 w-full justify-between rounded-sm border-border bg-input px-3 data-mono text-left font-normal hover:bg-input"
        >
          <span className="min-w-0 truncate">
            {selectedDriver ? `#${selectedDriver.number} ${selectedDriver.name}` : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search driver, team, or number..." />
          <CommandList>
            <CommandEmpty>No driver found.</CommandEmpty>
            <CommandGroup>
              {drivers.map((driver) => (
                <CommandItem
                  key={driver.id}
                  value={`${driver.name} ${driver.team} ${driver.number} ${driver.id}`}
                  onSelect={() => {
                    onValueChange(driver.id);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <span className="h-2 w-2 shrink-0 bg-signal" />
                  <span className="min-w-0 flex-1 truncate">
                    #{driver.number} {driver.name}
                  </span>
                  <span className="data-mono hidden shrink-0 text-[10px] uppercase text-muted-foreground sm:inline">
                    {driver.team}
                  </span>
                  <Check className={cn("h-4 w-4 shrink-0", value === driver.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const PredictionForm = ({ race, type, locked }: PredictionFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [pole, setPole] = useState("");
  const [constructor, setConstructor] = useState("");
  const [unexpected, setUnexpected] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const { drivers, isLoading: loadingDrivers } = useDrivers();
  const teamsWithColors = useMemo(
    () => Array.from(new Set(drivers.map((d) => d.team))).sort().map((team) => ({ team })),
    [drivers],
  );

  const isSprint = type === "sprint";
  const pointMultiplier = isSprint ? 0.5 : 1;
  const picks = { p1, p2, p3 };

  useEffect(() => {
    const loadPrediction = async () => {
      if (!user) return;

      try {
        setInitializing(true);
        const prediction = await getUserPrediction(race.id, type);
        setP1(prediction.predictedP1);
        setP2(prediction.predictedP2);
        setP3(prediction.predictedP3);
        setPole(prediction.predictedPole);
        setConstructor(prediction.predictedConstructor || "");
        setUnexpected(prediction.unexpectedStatement);
      } catch {
        // No existing prediction.
      } finally {
        setInitializing(false);
      }
    };

    loadPrediction();
  }, [race.id, type, user]);

  const canSubmit = p1 && p2 && p3 && pole && constructor && unexpected.length >= 10 && !locked && !loading;
  const filled = [p1, p2, p3, pole, constructor].filter(Boolean).length;
  const estimatedPoints = (25 + 20 + 15 + 20 + 10 + 15) * pointMultiplier;

  const driverName = (id: string) => drivers.find((driver) => driver.id === id)?.name ?? "Unassigned";
  const driverMeta = (id: string) => {
    const driver = drivers.find((d) => d.id === id);
    return driver ? `#${driver.number} / ${driver.team}` : "SELECT FROM GRID";
  };

  const handleSubmit = async () => {
    if (!user) return;

    const podium = [p1, p2, p3];
    if (new Set(podium).size !== 3) {
      toast.error("Each podium position must be a different driver");
      return;
    }

    if (unexpected.length < 10 || unexpected.length > 200) {
      toast.error("Unexpected pick must be 10-200 characters");
      return;
    }

    try {
      setLoading(true);
      await submitPrediction({
        raceWeekendId: race.id,
        type,
        predictedP1: p1,
        predictedP2: p2,
        predictedP3: p3,
        predictedPole: pole,
        predictedConstructor: constructor,
        unexpectedStatement: unexpected,
      });

      toast.success(`${isSprint ? "Sprint" : "Race"} prediction submitted`);
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit prediction";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing || loadingDrivers) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-signal" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-12">
      <CockpitPanel
        className="xl:col-span-7"
        code="PRD.A"
        title="Finishing order"
        action={<span className="data-mono text-[10px] text-muted-foreground">{filled}/5 REQUIRED</span>}
        corners
      >
        <div className="divide-y divide-border">
          {slots.map((slot, index) => {
            const value = picks[slot.key];
            const selected = [p1, p2, p3].filter(Boolean);
            return (
              <div key={slot.key} className={cn("grid min-w-0 gap-3 px-3 py-4 sm:px-4 md:grid-cols-12 md:items-center", index === 0 && "bg-signal/5")}>
                <div className="flex min-w-0 items-center gap-3 md:col-span-2">
                  <span className="data-mono text-3xl font-bold text-white">{slot.label}</span>
                  <span className="data-mono text-[10px] text-signal">+{slot.points * pointMultiplier} PTS</span>
                </div>
                <div className="min-w-0 md:col-span-5">
                  <div className="display truncate text-base font-semibold text-white">{value ? driverName(value) : "Empty slot"}</div>
                  <div className="data-mono mt-1 truncate text-[10px] uppercase text-muted-foreground">{value ? driverMeta(value) : "SELECT FROM DRIVER LIST"}</div>
                </div>
                <div className="min-w-0 md:col-span-5">
                  <DriverCombobox
                    drivers={drivers.filter((driver) => driver.id === value || !selected.includes(driver.id))}
                    value={value}
                    onValueChange={slot.key === "p1" ? setP1 : slot.key === "p2" ? setP2 : setP3}
                    placeholder={`Select ${slot.label}`}
                    disabled={locked}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border bg-surface-2/35 p-3 sm:p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="label-eyebrow mb-2 block">{isSprint ? "Sprint pole" : "Pole position"} / +{10 * pointMultiplier} pts</Label>
              <DriverCombobox
                drivers={drivers}
                value={pole}
                onValueChange={setPole}
                placeholder="Select pole position"
                disabled={locked}
              />
            </div>

            <div>
              <Label className="label-eyebrow mb-2 block">Top constructor / +{10 * pointMultiplier} pts</Label>
              <Select value={constructor} onValueChange={setConstructor} disabled={locked}>
                <SelectTrigger className="h-11 rounded-sm border-border bg-input data-mono">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teamsWithColors.map((team) => (
                    <SelectItem key={team.team} value={team.team}>
                      {team.team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CockpitPanel>

      <div className="space-y-6 xl:col-span-5">
        <CockpitPanel
          code="BRF.B"
          title="Race brief"
          action={<Trophy className="h-4 w-4 text-signal" />}
          bodyClassName="p-4"
          corners
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="panel-subtle">
                <p className="label-eyebrow">Round</p>
                <p className="data-mono mt-2 text-2xl font-bold text-white">R{race.round}</p>
              </div>
              <div className="panel-subtle">
                <p className="label-eyebrow">Mode</p>
                <p className="data-mono mt-2 text-2xl font-bold text-white">{isSprint ? "SPR" : "GP"}</p>
              </div>
            </div>
            <div className="panel-subtle">
              <p className="label-eyebrow">Potential yield</p>
              <p className="data-mono mt-2 text-3xl font-bold text-signal">+{estimatedPoints}</p>
              <p className="data-mono mt-1 text-[10px] text-muted-foreground">BASELINE MAX BEFORE BONUS SCORING</p>
            </div>
            <div className="flex items-center gap-2 border border-border bg-surface-2 px-3 py-2 data-mono text-[10px] text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-signal" />
              Duplicate podium drivers are blocked before submit.
            </div>
          </div>
        </CockpitPanel>

        <CockpitPanel code="XPC.C" title="Unexpected pick" bodyClassName="p-4">
          <Label className="label-eyebrow mb-2 block">Scenario / +{15 * pointMultiplier} pts</Label>
          <Textarea
            placeholder="Example: Albon finishes in the top 5."
            value={unexpected}
            onChange={(event) => setUnexpected(event.target.value.slice(0, 200))}
            disabled={locked}
            className="h-32 resize-none rounded-sm border-border bg-input data-mono text-sm"
          />
          <p className="data-mono mt-2 text-right text-xs text-muted-foreground">{unexpected.length}/200</p>
        </CockpitPanel>

        {!locked && !canSubmit && (
          <div className="panel border-warning/30 bg-warning/10 p-4 data-mono text-xs text-warning">
            {!p1 && <p>Select a driver for P1</p>}
            {!p2 && <p>Select a driver for P2</p>}
            {!p3 && <p>Select a driver for P3</p>}
            {!pole && <p>Select pole position</p>}
            {!constructor && <p>Select a constructor</p>}
            {unexpected.length < 10 && <p>Unexpected pick needs at least 10 characters ({unexpected.length}/10)</p>}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full text-xs sm:text-sm" size="lg" variant="signal">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Lock className="h-4 w-4" />
          {locked ? "Predictions locked" : loading ? "Submitting..." : `Submit ${isSprint ? "sprint" : "race"} prediction`}
        </Button>
      </div>
    </div>
  );
};

export default PredictionForm;
