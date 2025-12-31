import React, { useMemo } from "react";
import { PageSection, SectionType } from "@/types/pageBuilder";

// Import section components
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import TeamSection from "@/components/TeamSection";
import SponsorsSection from "@/components/SponsorsSection";
import RegisterSection from "@/components/RegisterSection";
import Footer from "@/components/Footer";

interface LivePreviewProps {
  sections: PageSection[];
}

// Map section types to components
const SECTION_COMPONENTS: Record<SectionType, React.ComponentType<{ config?: any }>> = {
  navbar: Navbar,
  hero: HeroSection,
  about: AboutSection,
  events: EventsSection,
  team: TeamSection,
  sponsors: SponsorsSection,
  blog: () => null, // BlogSection will be added later
  register: RegisterSection,
  footer: Footer,
};

const LivePreview: React.FC<LivePreviewProps> = ({ sections }) => {
  const visibleSections = useMemo(() => {
    return sections
      .filter(s => s.is_visible)
      .sort((a, b) => a.order_index - b.order_index);
  }, [sections]);

  return (
    <div className="h-full flex flex-col">
      {/* Preview header */}
      <div className="p-2 bg-gray-200 border-b flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">Превью страницы</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Preview content with scaling */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="w-full h-full overflow-auto">
          <div
            className="origin-top-left"
            style={{
              transform: 'scale(0.4)',
              width: '250%',
              minHeight: '250%',
            }}
          >
            <div className="min-h-screen bg-background">
              {visibleSections.map((section) => {
                const Component = SECTION_COMPONENTS[section.section_type];
                if (!Component) return null;

                return (
                  <div key={section.id} className="relative">
                    {/* Section highlight on hover could be added here */}
                    <Component config={section.config} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
