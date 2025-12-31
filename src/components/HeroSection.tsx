import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Wallet } from "lucide-react";
import AnimatedTitle from "./AnimatedTitle";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-12 md:pt-40 md:pb-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 md:mb-6">
            <div className="mb-1 md:mb-2">
              <span className="gradient-text">ИИшница</span>
            </div>
            <AnimatedTitle />
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Еженедельные практические завтраки с искусственным интеллектом
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12 px-4 sm:px-0">
            <a href="#register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 px-6 md:px-8 py-5 md:py-6 text-sm md:text-base">
                Зарегистрироваться <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </a>
            <a href="#about" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base">
                Подробнее о клубе
              </Button>
            </a>
          </div>

          {/* Info badges - stack vertically on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-6 text-sm text-muted-foreground px-4 sm:px-0">
            <div className="flex items-center bg-green-100/50 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full w-full sm:w-auto justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500 mr-2 md:mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-lg font-medium whitespace-nowrap">По вторникам</span>
            </div>
            <div className="flex items-center bg-blue-100/50 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full w-full sm:w-auto justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500 mr-2 md:mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-lg font-medium whitespace-nowrap">10:00 - 12:00</span>
            </div>
            <div className="flex items-center bg-purple-100/50 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full w-full sm:w-auto justify-center">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-500 mr-2 md:mr-3 flex-shrink-0" />
              <span className="text-sm sm:text-base md:text-lg font-medium whitespace-nowrap">25 BYN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements - hidden on mobile, smaller on tablet */}
      <div className="hidden md:block absolute top-24 left-10 w-16 lg:w-24 h-16 lg:h-24 bg-purple-200 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
      <div className="hidden md:block absolute top-40 right-10 lg:right-20 w-20 lg:w-32 h-20 lg:h-32 bg-blue-200 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
    </section>
  );
};

export default HeroSection;
