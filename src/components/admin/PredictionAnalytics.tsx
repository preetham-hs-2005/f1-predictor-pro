import { useMemo } from "react";
import { getStoredScores } from "@/lib/data/results";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Zap } from "lucide-react";

const PredictionAnalytics = ({ raceId, predType }: { raceId: string; predType: "race" | "sprint" }) => {
  const scores = getStoredScores().filter((s) => s.raceId === raceId && s.type === predType);

  const stats = useMemo(() => {
    if (scores.length === 0) {
      return {
        totalParticipants: 0,
        perfectPredictions: 0,
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        p1Accuracy: 0,
        p2Accuracy: 0,
        p3Accuracy: 0,
        poleAccuracy: 0,
        podiumAccuracy: 0,
      };
    }

    const totalParticipants = scores.length;
    const perfectPredictions = scores.filter(
      (s) => s.p1Points && s.p2Points && s.p3Points
    ).length;
    const avgScore = Math.round(
      scores.reduce((sum, s) => sum + (s.total || 0), 0) / totalParticipants
    );
    const highestScore = Math.max(...scores.map((s) => s.total || 0));
    const lowestScore = Math.min(...scores.map((s) => s.total || 0));

    const p1Accuracy = Math.round(
      (scores.filter((s) => s.p1Points > 0).length / totalParticipants) * 100
    );
    const p2Accuracy = Math.round(
      (scores.filter((s) => s.p2Points > 0).length / totalParticipants) * 100
    );
    const p3Accuracy = Math.round(
      (scores.filter((s) => s.p3Points > 0).length / totalParticipants) * 100
    );
    const poleAccuracy = Math.round(
      (scores.filter((s) => s.polePoints > 0).length / totalParticipants) * 100
    );
    const podiumAccuracy = Math.round(
      (scores.filter((s) => s.podiumBonusPoints > 0).length / totalParticipants) * 100
    );

    return {
      totalParticipants,
      perfectPredictions,
      avgScore,
      highestScore,
      lowestScore,
      p1Accuracy,
      p2Accuracy,
      p3Accuracy,
      poleAccuracy,
      podiumAccuracy,
    };
  }, [scores]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="glass border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold f1-heading">{stats.totalParticipants}</p>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Perfect Podiums</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold f1-heading text-f1-gold">{stats.perfectPredictions}</p>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Avg Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold f1-heading">{stats.avgScore}</p>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Best/Worst</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs">
            <span className="text-f1-success font-bold">{stats.highestScore}</span>
            {" / "}
            <span className="text-muted-foreground font-bold">{stats.lowestScore}</span>
          </p>
        </CardContent>
      </Card>

      {/* Accuracy metrics */}
      <Card className="glass border-0 col-span-2 md:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Prediction Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">P1 Correct</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold f1-heading">{stats.p1Accuracy}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">P2 Correct</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold f1-heading">{stats.p2Accuracy}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">P3 Correct</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold f1-heading">{stats.p3Accuracy}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Pole</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold f1-heading">{stats.poleAccuracy}%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Podium</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold f1-heading">{stats.podiumAccuracy}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionAnalytics;
