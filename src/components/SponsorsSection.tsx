
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const { data, error } = await supabase
          .from("sponsors")
          .select("id, name, logo_url, website_url")
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

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
            Наши <span className="gradient-text">спонсоры</span>
          </h2>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="py-4">
            {sponsors.map((sponsor) => (
              <CarouselItem key={sponsor.id} className="md:basis-1/3 lg:basis-1/4">
                <div className="h-32 p-4 flex flex-col items-center justify-center text-center rounded-lg border border-gray-100 hover:shadow-md transition duration-300">
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
                        className="max-h-24 max-w-full object-contain mx-auto" 
                      />
                    </a>
                  ) : (
                    <a 
                      href={sponsor.website_url || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {sponsor.name}
                    </a>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default SponsorsSection;
