import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, MessageSquareText, Radio, Trophy } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { BrandMark } from "@/components/layout/BrandMark";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/dashboard");
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <PageShell>
      <div className="container relative z-10 flex min-h-screen flex-col pb-12 pt-4 sm:pb-16 sm:pt-6">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <BrandMark />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="px-3 sm:px-4">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="px-3 sm:px-4">
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">Join Now</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-8 sm:py-10">
          <div className="mx-auto w-full max-w-6xl">
            <section className="hero-panel overflow-hidden">
              <div className="checker absolute right-0 top-0 h-72 w-72 opacity-[0.06]" />
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <p className="page-eyebrow">F1 Predictor Pro</p>
                  <span className="h-px w-16 bg-border" />
                  <span className="data-mono text-[10px] text-signal">RACE CONTROL ONLINE</span>
                </div>
                <h1 className="display mt-4 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
                  Race picks, standings, and results in one cockpit.
                </h1>
                <p className="data-mono mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Sign in to submit predictions, watch lock windows, track results, and follow your league table.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" variant="signal" className="w-full sm:min-w-[220px]">
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="cockpit" size="lg" className="w-full sm:min-w-[220px]">
                      Sign In
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="panel-subtle">
                    <Clock3 className="h-5 w-5 text-signal" />
                    <p className="display mt-4 text-lg font-semibold text-white">Lock times</p>
                    <p className="data-mono mt-2 text-xs leading-6 text-muted-foreground">Qualifying and race deadlines.</p>
                  </div>
                  <div className="panel-subtle">
                    <Trophy className="h-5 w-5 text-signal" />
                    <p className="display mt-4 text-lg font-semibold text-white">Standings</p>
                    <p className="data-mono mt-2 text-xs leading-6 text-muted-foreground">Season points and rankings.</p>
                  </div>
                  <div className="panel-subtle sm:col-span-2 lg:col-span-1">
                    <MessageSquareText className="h-5 w-5 text-signal" />
                    <p className="display mt-4 text-lg font-semibold text-white">Discussions</p>
                    <p className="data-mono mt-2 text-xs leading-6 text-muted-foreground">Race threads and polls.</p>
                  </div>
                </div>

                <div className="panel mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 p-4 data-mono text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Radio className="h-3 w-3 text-signal" />
                    TELEMETRY FEED READY
                  </span>
                  <span>AUTH / REQUIRED</span>
                  <span>LEAGUE / ACTIVE</span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </PageShell>
  );
};

export default Index;
