import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Blog = () => {
  const { t } = useLanguage();

  React.useEffect(() => {
    document.title = `${t.blogTitle}`;
  }, [t.blogTitle]);

  return (
    <main className="container py-10">
      <header className="mb-8 flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link to="/">{t.back}</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">{t.blogTitle}</h1>
      </header>

      <section className="max-w-3xl animate-fade-in">
        <p className="text-muted-foreground">{t.comingSoon}</p>
      </section>
    </main>
  );
};

export default Blog;
