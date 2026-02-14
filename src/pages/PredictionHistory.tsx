import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserPredictions } from "@/lib/api/predictions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Trophy } from "lucide-react";
import { toast } from "sonner";

export interface PredictionData {
  id: string;
  userId: string;
  raceWeekendId: string;
  type: "sprint" | "race";
  predictedP1: string;
  predictedP2: string;
  predictedP3: string;
  predictedPole: string;
  unexpectedStatement: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const PredictionHistory = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const data = await getUserPredictions();
        setPredictions(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load predictions";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-24 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="f1-heading text-3xl">Prediction History</h1>
            <p className="text-muted-foreground">
              View all your race predictions
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : predictions.length === 0 ? (
          <Card className="p-8 text-center glass border-dashed">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start making predictions for upcoming races to see them here.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {predictions.map((prediction) => (
              <Card
                key={`${prediction.raceWeekendId}-${prediction.type}`}
                className="glass p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="f1-heading text-lg">
                        Race {prediction.raceWeekendId}
                      </h3>
                      <Badge variant="secondary">
                        {prediction.type === "sprint" ? "Sprint" : "Race"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">P1</p>
                        <p className="font-semibold">{prediction.predictedP1}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">P2</p>
                        <p className="font-semibold">{prediction.predictedP2}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">P3</p>
                        <p className="font-semibold">{prediction.predictedP3}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Pole</p>
                        <p className="font-semibold">{prediction.predictedPole}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Unexpected</p>
                        <p className="text-xs font-semibold truncate">
                          {prediction.unexpectedStatement || "N/A"}
                        </p>
                      </div>
                    </div>

                    {prediction.unexpectedStatement && (
                      <div className="mt-3 p-3 bg-f1-warning/10 rounded border border-f1-warning/30">
                        <p className="text-xs text-muted-foreground mb-1">
                          Unexpected Statement
                        </p>
                        <p className="text-sm">{prediction.unexpectedStatement}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/predict/${prediction.raceWeekendId}?type=${prediction.type}`)}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PredictionHistory;
