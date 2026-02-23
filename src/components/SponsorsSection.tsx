import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SponsorsConfig, DEFAULT_SPONSORS_CONFIG } from "@/types/pageBuilder";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: 'general_partner' | 'partner' | 'sponsor';
}

interface SponsorsSectionProps {
  config?: SponsorsConfig;
}

const SponsorsSection: React.FC<SponsorsSectionProps> = ({ config }) => {
  const cfg = config ?? DEFAULT_SPONSORS_CONFIG;
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const { data, error } = await supabase
          .from("sponsors")
          .select("id, name, logo_url, website_url, tier")
          .eq("is_active", true);
        
        if (error) throw error;
        setSponsors(data || []);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  if (loading) return null;
  if (sponsors.length === 0) return null;

  const generalPartners = sponsors.filter(s => s.tier === 'general_partner');
  const regularSponsors = sponsors.filter(s => s.tier !== 'general_partner');

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold mb-3 md:mb-4">
            {cfg.title.prefix} <span className="gradient-text">{cfg.title.highlight}</span>
          </h2>
        </div>

        {generalPartners.length > 0 && (
          <div className="mb-6 md:mb-8">
            <p className="text-center text-sm text-muted-foreground mb-4">
              {generalPartners.length === 1 ? "Генеральный партнёр" : "Генеральные партнёры"}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
              {generalPartners.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="max-h-20 md:max-h-32 max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-semibold text-lg">{sponsor.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {regularSponsors.length > 0 && (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="py-2 md:py-4">
              {regularSponsors.map((sponsor) => (
                <CarouselItem key={sponsor.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/4">
                  <div className="h-24 md:h-32 p-3 md:p-4 flex flex-col items-center justify-center text-center rounded-lg border border-gray-100 hover:shadow-md transition duration-300">
                    {sponsor.logo_url ? (
                      <a
                        href={sponsor.website_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-full flex items-center"
                      >
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="max-h-16 md:max-h-24 max-w-full object-contain mx-auto"
                        />
                      </a>
                    ) : (
                      <a
                        href={sponsor.website_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm md:text-base hover:underline"
                      >
                        {sponsor.name}
                      </a>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default SponsorsSection;
