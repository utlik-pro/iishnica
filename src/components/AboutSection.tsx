import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MessageSquare } from "lucide-react";
import { AboutConfig, DEFAULT_ABOUT_CONFIG } from "@/types/pageBuilder";

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
    <section id="about" className="py-12 md:py-16 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
            {cfg.title.prefix} <span className="gradient-text">{cfg.title.highlight}</span>?
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground px-2">
            {cfg.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {cfg.cards.map((card) => {
            const Icon = CARD_ICONS[card.icon];
            return (
              <Card key={card.id} className="border border-purple-100 bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <h3 className="text-base md:text-xl font-bold mb-1.5 md:mb-2">{card.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-8">
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
