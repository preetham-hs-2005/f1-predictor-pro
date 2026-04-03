import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { BrandMark } from "@/components/layout/BrandMark";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Invalid credentials");
      }
    } catch {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_0.9fr]">
          <section className="hero-panel hidden lg:block">
            <BrandMark />
            <p className="page-eyebrow mt-10">Sign back into the paddock</p>
            <h1 className="mt-4 font-heading text-5xl leading-tight text-white">Every race weekend starts here.</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/65">
              See the calendar, lock predictions before qualifying, and keep pace with the leaderboard in a single flow.
            </p>
            <div className="mt-10 grid gap-3">
              {["Live race deadlines", "Premium multi-page redesign", "Existing league features preserved"].map((item) => (
                <div key={item} className="panel-subtle flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-white/78">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="section-card mx-auto w-full max-w-xl animate-slide-up p-8 md:p-10">
            <BrandMark compact className="justify-center lg:hidden" />
            <div className="mt-6 text-center lg:mt-0 lg:text-left">
              <p className="page-eyebrow">Welcome back</p>
              <h1 className="mt-3 font-heading text-3xl text-white md:text-4xl">Sign in to Apex Grid</h1>
              <p className="mt-3 text-sm leading-7 text-white/60">Pick up right where your season left off.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="driver@f1.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/55 lg:text-left">
              New here?{" "}
              <Link to="/register" className="text-primary transition-colors hover:text-primary/80">
                Create your account
              </Link>
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
};

export default Login;
