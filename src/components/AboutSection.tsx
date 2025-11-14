import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MessageSquare } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Что такое <span className="gradient-text">ИИшница</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            ИИшница — это еженедельный клуб-завтрак, где мы вместе решаем практические задачи с использованием искусственного интеллекта.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border border-purple-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Еженедельные встречи</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Каждый вторник с 10:00 до 12:00 мы собираемся, чтобы решать практические задачи с помощью ИИ.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-purple-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Практический подход</h3>
              <p className="text-muted-foreground">
                На каждом завтраке мы фокусируемся на решении одной конкретной задачи с использованием технологий ИИ.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-purple-100 bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Сообщество</h3>
              <p className="text-muted-foreground">
                Присоединяйтесь к растущему комьюнити энтузиастов ИИ, обменивайтесь идеями и развивайте навыки вместе с нами.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
