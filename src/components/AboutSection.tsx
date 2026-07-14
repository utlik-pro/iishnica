import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MessageSquare } from "lucide-react";
import { AboutConfig, DEFAULT_ABOUT_CONFIG } from "@/types/pageBuilder";
import SectionEyebrow from "@/components/SectionEyebrow";

interface AboutSectionProps {
  config?: AboutConfig;
}

const CARD_ICONS = {
  calendar: Calendar,
  message: MessageSquare,
  users: Users,
};

const AboutSection: React.FC<AboutSectionProps> = ({ config }) => {
  const cfg = config ?? DEFAULT_ABOUT_CONFIG;

  return (
    <section id="about" className="py-12 md:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 ambient-lime opacity-60 pointer-events-none" aria-hidden />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16">
          <SectionEyebrow>О клубе</SectionEyebrow>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4 tracking-tight">
            {cfg.title.prefix} <span className="gradient-text">{cfg.title.highlight}</span>?
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground px-2">
            {cfg.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {cfg.cards.map((card) => {
            const Icon = CARD_ICONS[card.icon];
            return (
              <Card key={card.id} className="border-white/[0.08] bg-white/[0.03] backdrop-blur-sm rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.14] hover:-translate-y-1 transition-all duration-300">
                <CardContent className="pt-5 md:pt-7 px-5 md:px-7 pb-5 md:pb-7">
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <h3 className="text-base md:text-xl font-bold mb-1.5 md:mb-2">{card.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
