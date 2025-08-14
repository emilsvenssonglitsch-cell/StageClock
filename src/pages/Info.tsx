import React from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const InfoPage = () => {
  const { t } = useLanguage();

  React.useEffect(() => {
    document.title = `${t.aboutTitle} – StageClock`;
  }, [t.aboutTitle]);

  return (
    <main className="container py-10">
      <header className="mb-8 flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link to="/">{t.back}</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">{t.aboutTitle}</h1>
      </header>

      <section className="max-w-3xl animate-fade-in">
        <p className="text-muted-foreground mb-3">{t.aboutDescription1}</p>
        <p className="text-muted-foreground mb-3">{t.aboutDescription2}</p>
        <p className="text-muted-foreground">{t.aboutDescription3}</p>

        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="keys">
              <AccordionTrigger>{t.keyboardShortcuts}</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t.keyboardShortcutSpace}</li>
                  <li>{t.keyboardShortcutR}</li>
                  <li>{t.keyboardShortcutShiftR}</li>
                  <li>{t.keyboardShortcutF}</li>
                  <li>{t.keyboardShortcutArrows}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="url">
              <AccordionTrigger>{t.urlTricks}</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{t.urlTricksDescription}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </main>
  );
};

export default InfoPage;
