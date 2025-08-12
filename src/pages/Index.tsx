import React from "react";
import BigTimer from "@/components/timer/BigTimer";

const Index = () => {
  React.useEffect(() => {
    document.title = "StageClock – Stor nedtellingstimer";
    const desc = "StageClock – stor og tydelig nedtelling for scene og presentasjoner.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  return (
    <main className="min-h-screen w-full flex">
      <section className="flex-1 w-full h-full">
        <BigTimer />
      </section>
    </main>
  );
};

export default Index;
