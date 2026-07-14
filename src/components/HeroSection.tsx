import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Wallet } from "lucide-react";
import AnimatedTitle from "./AnimatedTitle";
import { HeroConfig, DEFAULT_HERO_CONFIG } from "@/types/pageBuilder";

interface HeroSectionProps {
  config?: HeroConfig;
}

const BADGE_ICONS = {
  calendar: Calendar,
  clock: Clock,
  wallet: Wallet,
};

const HeroSection: React.FC<HeroSectionProps> = ({ config }) => {
  const cfg = config ?? DEFAULT_HERO_CONFIG;

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Background photo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <img
          src="/og-image.png"
          alt=""
          className="w-full h-full object-cover object-center opacity-40"
        />
        {/* Dark, left-weighted overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/70" />
        <div className="absolute inset-0 ambient-lime opacity-70" />
      </div>

      {/* Floating lime orb */}
      <div className="hidden md:block absolute top-1/3 right-16 lg:right-40 w-40 h-40 bg-primary/15 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" aria-hidden />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2.5 mb-6 md:mb-8 pl-3 pr-4 py-1.5 rounded-full border border-primary/25 bg-primary/[0.06] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-lime-sm animate-pulse-slow" />
            <span className="text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase text-primary">
              M.AI.N Community
            </span>
          </div>

          <h1 className="font-heading font-black mb-5 md:mb-7 tracking-tight leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block text-foreground">{cfg.title}</span>
            <span className="block mt-1">
              <AnimatedTitle />
            </span>
          </h1>

          {/* Subtitle with logo mark */}
          <div className="flex items-center gap-3 mb-8 md:mb-10 max-w-2xl">
            <img src="/Main-logo.webp" alt="M.AI.N" className="h-7 md:h-9 w-auto flex-shrink-0" />
            <p className="text-base sm:text-lg md:text-2xl font-medium text-foreground/90">
              {cfg.subtitle}
            </p>
          </div>

          {/* Info chips — left aligned */}
          <div className="flex flex-wrap items-center gap-2.5 md:gap-3 mb-8 md:mb-10">
            {cfg.badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.icon];
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-2.5 border border-white/[0.1] bg-black/40 px-4 md:px-5 py-2.5 md:py-3 rounded-xl backdrop-blur-md"
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <span className="text-sm md:text-base font-medium text-foreground whitespace-nowrap">
                    {badge.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            {cfg.buttons.map((button) => (
              <a key={button.id} href={button.target} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className={`w-full sm:w-auto rounded-xl px-7 md:px-9 py-6 md:py-7 text-sm md:text-base font-semibold transition-all ${
                    button.variant === 'primary'
                      ? 'btn-lime-gradient hover:opacity-95 shadow-lime'
                      : 'bg-white/[0.06] text-foreground border border-white/[0.12] hover:bg-white/[0.1] backdrop-blur-md'
                  }`}
                >
                  {button.variant === 'primary' && button.icon === 'ArrowRight' && (
                    <ArrowRight className="mr-1 h-4 w-4 md:h-5 md:w-5" />
                  )}
                  {button.text}
                  {button.variant !== 'primary' && button.icon === 'ArrowRight' && (
                    <ArrowRight className="ml-1 h-4 w-4 md:h-5 md:w-5" />
                  )}
                </Button>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
