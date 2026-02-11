import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Flag, Trophy, Timer, Zap } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <header className="relative z-10 container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          <span className="f1-heading text-lg">
            <span className="text-gradient-f1">F1</span>{" "}
            <span className="text-foreground">Predict</span>
          </span>
        </div>
        <Link to="/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center px-4 animate-slide-up">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
              Season 2026
            </span>
          </div>

          <h1 className="f1-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-2 leading-[0.95]">
            <span className="text-gradient-f1">F1</span>
          </h1>
          <h2 className="f1-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8 text-foreground leading-tight">
            Prediction League
          </h2>

          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Predict podiums. Outsmart your friends.
            <br />
            Claim the championship.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link to="/register">
              <Button size="lg" className="min-w-[180px]">
                Join the Grid
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="min-w-[180px]">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-f1-gold" />
              <span>Leaderboards</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-primary" />
              <span>Live Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-f1-warning" />
              <span>Sprint Scoring</span>
            </div>
          </div>
        </div>
      </main>

      <div className="racing-stripe" />
    </div>
  );
};

export default Index;
