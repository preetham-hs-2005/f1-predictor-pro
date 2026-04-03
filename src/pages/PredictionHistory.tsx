import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Loader2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPredictions } from "@/lib/api/predictions";

export interface PredictionData {
  id: string;
  userId: string;
  raceWeekendId: string;
  type: "sprint" | "race";
  predictedP1: string;
  predictedP2: string;
  predictedP3: string;
  predictedPole: string;
  predictedConstructor?: string;
  unexpectedStatement: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const PredictionHistory = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) setLoading(true);
  }, [authLoading]);

  useEffect(() => {
    if (authLoading) return;
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
  }, [isAuthenticated, navigate, authLoading]);

  return (
    <PageShell>
      <Navbar />
      <main className="container pb-12 pt-28 md:pt-32">
        <PageHeader
          eyebrow="Your archive"
          title="Prediction history"
          description="Review every sprint and race call you've submitted so far, now in a cleaner magazine-style timeline."
          actions={
            <Button variant="outline" className="max-sm:w-full" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          }
          stats={[
            { label: "Entries", value: `${predictions.length}` },
            { label: "Race picks", value: `${predictions.filter((item) => item.type === "race").length}` },
            { label: "Sprint picks", value: `${predictions.filter((item) => item.type === "sprint").length}` },
            { label: "Status", value: loading ? "Loading" : "Ready" },
          ]}
        />

        {loading ? (
          <section className="section-card mt-8 flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </section>
        ) : predictions.length === 0 ? (
          <Card className="section-card mt-8 border-dashed p-10 text-center">
            <Trophy className="mx-auto h-12 w-12 text-white/35" />
            <h3 className="mt-4 font-heading text-2xl text-white">No predictions yet</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/60">
              Start making predictions for upcoming races and this archive will become your season story.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="mt-6">
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <section className="mt-8 grid gap-4">
            {predictions.map((prediction) => (
              <Card
                key={`${prediction.raceWeekendId}-${prediction.type}`}
                className="section-card p-4 sm:p-6 transition-all hover:-translate-y-1 hover:border-white/15"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="break-all font-heading text-xl text-white sm:text-2xl">Race {prediction.raceWeekendId}</h3>
                      <Badge
                        variant="outline"
                        className="rounded-full border-white/10 bg-white/[0.05] px-3 py-1 uppercase tracking-[0.18em] text-white/75"
                      >
                        {prediction.type}
                      </Badge>
                      <span className="flex items-center gap-2 text-sm text-white/45">
                        <Clock3 className="h-4 w-4" />
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                      {[
                        { label: "P1", value: prediction.predictedP1 },
                        { label: "P2", value: prediction.predictedP2 },
                        { label: "P3", value: prediction.predictedP3 },
                        { label: "Pole", value: prediction.predictedPole },
                        { label: "Constructor", value: prediction.predictedConstructor || "None" },
                        { label: "Unexpected", value: prediction.unexpectedStatement || "N/A" },
                      ].map((item) => (
                        <div key={item.label} className="panel-subtle min-w-0">
                          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
                          <p className="mt-3 truncate text-sm font-semibold text-white/82">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {prediction.unexpectedStatement && (
                      <div className="mt-4 rounded-[1.25rem] border border-f1-warning/18 bg-f1-warning/10 p-4">
                        <p className="page-eyebrow">Unexpected statement</p>
                        <p className="mt-2 text-sm leading-7 text-white/78">{prediction.unexpectedStatement}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full xl:w-auto"
                    onClick={() => navigate(`/predict/${prediction.raceWeekendId}?type=${prediction.type}`)}
                  >
                    Edit Pick
                  </Button>
                </div>
              </Card>
            ))}
          </section>
        )}
      </main>
    </PageShell>
  );
};

export default PredictionHistory;
