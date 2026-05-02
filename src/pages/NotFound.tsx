import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { BrandMark } from "@/components/layout/BrandMark";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageShell>
      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="hero-panel max-w-2xl text-center">
          <div className="flex justify-center">
            <BrandMark compact />
          </div>
          <p className="page-eyebrow mt-8">404</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">Page not found</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            The route <span className="text-white">{location.pathname}</span> does not exist.
          </p>
          <Link to="/" className="mt-8 inline-flex">
            <Button size="lg">Return home</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default NotFound;
