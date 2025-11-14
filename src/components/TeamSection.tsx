import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  initials: string;
};

const teamMembers: TeamMember[] = [
  {
    name: "Дмитрий Утлик",
    role: "Глава комьюнити M.AI.N",
    bio: "CEO Utlik, руководитель AI-комьюнити M.AI.N. Занимается стратегией, развитием продуктов и масштабированием ИИ-решений.",
    initials: "ДУ",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfuvYrdy2g4b8Gm-iFm_uq5HqOwqY2F3YD8naRgRlcTtZyeRykV4_5YcvpwY7oRwNPL20&usqp=CAU",
  },
  {
    name: "Денис Савицкий",
    role: "Венчурный стратег",
    bio: "CEO Zborka Labs, сооснователь VC Tractor VC Belarus. Эксперт по запуску стартапов и привлечению инвестиций.",
    initials: "ДС",
  },
  {
    name: "Евгений Прусак",
    role: "Product Owner",
    bio: "Предприниматель, AI-энтузиаст, спикер БК Терра. Формирует видение продуктов и помогает доводить их до пользователей.",
    initials: "ЕП",
  },
  {
    name: "Борис Мамоненко",
    role: "Бизнес-девелопер",
    bio: "Основатель Zborka Labs, сооснователь BelHard. Связывает технологии с бизнесом и помогает масштабировать решения.",
    initials: "БМ",
  },
  {
    name: "Яна Мартынко",
    role: "Эксперт по ивентам",
    bio: "СЕО Cozy Crew brand, AI-энтузиаст. Эксперт по публичным выступлениям и организации образовательных ивентов.",
    initials: "ЯМ",
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Наша <span className="gradient-text">команда</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Познакомьтесь с людьми, которые делают ИИшницу местом для роста и развития
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card key={index} className="border border-purple-100 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                    <Separator className="my-2" />
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
