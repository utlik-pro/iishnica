import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Wallet } from "lucide-react";
import AnimatedTitle from "./AnimatedTitle";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-16 md:pt-40 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            <div className="mb-2">
              <span className="gradient-text">ИИшница</span>
            </div>
            <AnimatedTitle />
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Еженедельные практические завтраки с искусственным интеллектом
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a href="#register">
              <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-base">
                Зарегистрироваться <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="#about">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base">
                Подробнее о клубе
              </Button>
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center bg-green-100/50 px-6 py-3 rounded-full">
              <Calendar className="w-6 h-6 text-green-500 mr-3" />
              <span className="text-lg font-medium">По вторникам</span>
            </div>
            <div className="flex items-center bg-blue-100/50 px-6 py-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-500 mr-3" />
              <span className="text-lg font-medium">10:00 - 12:00</span>
            </div>
            <div className="flex items-center bg-purple-100/50 px-6 py-3 rounded-full">
              <Wallet className="w-6 h-6 text-purple-500 mr-3" />
              <span className="text-lg font-medium">25 BYN</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-24 left-10 w-24 h-24 bg-purple-200 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
    </section>
  );
};

export default HeroSection;
