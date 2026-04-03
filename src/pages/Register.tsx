import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { BrandMark } from "@/components/layout/BrandMark";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.length < 2 || name.length > 50) {
      toast.error("Name must be 2-50 characters");
      return;
    }
    if (username.length < 3 || username.length > 20) {
      toast.error("Username must be 3-20 characters");
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await register(name, email, password, username);
      if (result.success) {
        toast.success("Welcome to the grid!");
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch {
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.85fr_1fr]">
          <section className="section-card order-2 w-full animate-slide-up p-8 md:p-10 lg:order-1">
            <BrandMark compact className="justify-center lg:hidden" />
            <div className="mt-6 text-center lg:mt-0 lg:text-left">
              <p className="page-eyebrow">Create your profile</p>
              <h1 className="mt-3 font-heading text-3xl text-white md:text-4xl">Join the rebranded grid</h1>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Build your identity, lock your race picks, and start climbing the standings.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Max Verstappen" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="flying_dutchman_33"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="driver@f1.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-white/55 lg:text-left">
              Already racing?{" "}
              <Link to="/login" className="text-primary transition-colors hover:text-primary/80">
                Sign in instead
              </Link>
            </p>
          </section>

          <section className="hero-panel order-1 hidden lg:block lg:order-2">
            <BrandMark />
            <p className="page-eyebrow mt-10">Fresh identity</p>
            <h2 className="mt-4 font-heading text-5xl leading-tight text-white">Same league logic, brand-new energy.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/65">
              The redesign keeps the full code structure and feature set while lifting the product into a more premium, modern experience.
            </p>
            <div className="mt-10 panel-subtle">
              <p className="flex items-center gap-2 text-white/78">
                <Sparkles className="h-5 w-5 text-primary" />
                Consistent across landing, dashboard, discussions, results, and admin views.
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
};

export default Register;
