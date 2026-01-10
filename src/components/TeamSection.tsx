import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { TeamConfig, DEFAULT_TEAM_CONFIG } from "@/types/pageBuilder";

interface TeamMember {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  photo_url: string | null;
  team_order: number;
}

interface TeamSectionProps {
  config?: TeamConfig;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const TeamSection: React.FC<TeamSectionProps> = ({ config }) => {
  const cfg = config ?? DEFAULT_TEAM_CONFIG;
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("speakers")
        .select("id, name, title, description, photo_url, team_order")
        .eq("is_team_member", true)
        .eq("is_active", true)
        .order("team_order", { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <section id="team" className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse text-sm md:text-base">Загрузка команды...</div>
        </div>
      </section>
    );
  }

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <section id="team" className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
            {cfg.title.prefix} <span className="gradient-text">{cfg.title.highlight}</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground px-2">
            {cfg.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member) => (
            <Card key={member.id} className="border border-purple-100 bg-white">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <Avatar className="h-12 w-12 md:h-16 md:w-16 border-2 border-primary/20 flex-shrink-0">
                    {member.photo_url && (
                      <AvatarImage src={member.photo_url} alt={member.name} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs md:text-sm">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-xl font-bold">{member.name}</h3>
                    {member.title && (
                      <p className="text-primary font-medium text-xs md:text-sm mb-1.5 md:mb-2">{member.title}</p>
                    )}
                    <Separator className="my-1.5 md:my-2" />
                    {member.description && (
                      <p className="text-muted-foreground text-xs md:text-sm whitespace-pre-line">{member.description}</p>
                    )}
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
