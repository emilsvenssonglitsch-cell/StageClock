import React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const InfoPage = () => {
  React.useEffect(() => {
    document.title = "Om – StageClock";
  }, []);

  return (
    <main className="container py-10">
      <header className="mb-8 flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link to="/">← Tilbake</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Om StageClock</h1>
      </header>

      <section className="max-w-3xl animate-fade-in">
        <p className="text-muted-foreground mb-3">StageClock er en app laget for presentasjoner og scener hvor du trenger en tydelig og stilren nedtelling.</p>
        <p className="text-muted-foreground mb-3">Appen er utviklet av Emil med hjelp fra Lovable (basert på GPT-5), og er inspirert av funksjonene og utseendet til bigtimer.net.</p>
        <p className="text-muted-foreground">StageClock lar deg styre tiden enkelt med tastatur, lydvarsler og fullskjermmodus.</p>

        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="keys">
              <AccordionTrigger>Tastatursnarveier</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Mellomrom: start/pause</li>
                  <li>R: nullstill</li>
                  <li>Shift + R: veksle gjenta</li>
                  <li>F: fullskjerm</li>
                  <li>Pil opp/ned: øk/reduser tid (+/- 1 min)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="url">
              <AccordionTrigger>URL-triks</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">Kommer snart – angi starttid via URL-parametere.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </main>
  );
};

export default InfoPage;
