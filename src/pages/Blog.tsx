import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Blog = () => {
  React.useEffect(() => {
    document.title = "Blog – Big Timer";
  }, []);

  return (
    <main className="container py-10">
      <header className="mb-8 flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link to="/">← Back</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Blog – Big Timer</h1>
      </header>

      <section className="max-w-3xl animate-fade-in">
        <p className="text-muted-foreground">Coming soon.</p>
      </section>
    </main>
  );
};

export default Blog;
