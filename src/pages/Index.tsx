import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, MessageSquareText, Trophy } from "lucide-react";

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
          <BrandMark />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Join Now</Button>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-8 sm:py-10">
          <div className="mx-auto w-full max-w-6xl">
            <section className="hero-panel overflow-hidden">
              <div className="relative z-10">
                <p className="page-eyebrow">Prediction League</p>
                <h1 className="mt-4 max-w-4xl font-heading text-4xl leading-[0.95] text-white sm:text-5xl md:text-7xl">
                  Predict every race.
                  <span className="block text-gradient-f1">Own the season.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                  F1 Predict gives your league a clean home for race picks, leaderboards, results, and discussions without the clutter.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:min-w-[220px]">
                      Join the Grid
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:min-w-[220px]">
                      Sign In
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="panel-subtle">
                      <Clock3 className="h-5 w-5 text-primary" />
                      <p className="mt-4 font-heading text-lg text-white">Lock timers</p>
                      <p className="mt-2 text-sm leading-7 text-white/58">Never miss qualifying or race deadlines.</p>
                    </div>
                    <div className="panel-subtle">
                      <Trophy className="h-5 w-5 text-primary" />
                      <p className="mt-4 font-heading text-lg text-white">Leaderboard</p>
                      <p className="mt-2 text-sm leading-7 text-white/58">Track points and season momentum live.</p>
                    </div>
                    <div className="panel-subtle sm:col-span-2 lg:col-span-1">
                      <MessageSquareText className="h-5 w-5 text-primary" />
                      <p className="mt-4 font-heading text-lg text-white">Discussions</p>
                      <p className="mt-2 text-sm leading-7 text-white/58">Keep the race-weekend talk going.</p>
                    </div>
                  </div>

                  <div className="section-card bg-[linear-gradient(160deg,rgba(255,88,57,0.14),rgba(255,255,255,0.03))]">
                    <p className="page-eyebrow">Why it works</p>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-4">
                        <p className="font-heading text-lg text-white sm:text-xl">Simple before login</p>
                        <p className="mt-2 text-sm leading-7 text-white/60">
                          A focused landing page that explains the product fast instead of stacking too many promo blocks.
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-4">
                        <p className="font-heading text-lg text-white sm:text-xl">Built for your league</p>
                        <p className="mt-2 text-sm leading-7 text-white/60">
                          Predictions, standings, results, and community all stay connected under one identity.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_center,rgba(255,79,50,0.18),transparent_70%)] lg:block" />
            </section>
          </div>
        </main>
      </div>
    </PageShell>
  );
};

export default Index;
