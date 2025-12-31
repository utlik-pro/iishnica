import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import BlogSection from "@/components/BlogSection";
import RegisterSection from "@/components/RegisterSection";
import TeamSection from "@/components/TeamSection";
import SponsorsSection from "@/components/SponsorsSection";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  PageSection,
  SectionType,
  NavbarConfig,
  HeroConfig,
  AboutConfig,
  EventsConfig,
  TeamConfig,
  SponsorsConfig,
  BlogConfig,
  RegisterConfig,
  FooterConfig,
} from "@/types/pageBuilder";

const Index = () => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageConfig();
  }, []);

  const fetchPageConfig = async () => {
    try {
      // Get page config
      const { data: pageConfig } = await supabase
        .from('page_configs')
        .select('id')
        .eq('page_slug', 'home')
        .single();

      if (pageConfig) {
        // Fetch sections
        const { data: sectionsData } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_config_id', pageConfig.id)
          .order('order_index', { ascending: true });

        if (sectionsData) {
          setSections(sectionsData as PageSection[]);
        }
      }
    } catch (error) {
      console.error('Error fetching page config:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfig = <T,>(type: SectionType): T | undefined => {
    const section = sections.find(s => s.section_type === type && s.is_visible);
    return section?.config as T | undefined;
  };

  const isVisible = (type: SectionType): boolean => {
    if (sections.length === 0) return true; // Show all if no config loaded yet
    const section = sections.find(s => s.section_type === type);
    return section?.is_visible ?? true;
  };

  // Sort sections by order_index for rendering
  const sortedSectionTypes = sections.length > 0
    ? sections
        .filter(s => s.is_visible)
        .sort((a, b) => a.order_index - b.order_index)
        .map(s => s.section_type)
    : ['navbar', 'hero', 'about', 'events', 'blog', 'team', 'sponsors', 'register', 'footer'];

  const renderSection = (type: SectionType) => {
    switch (type) {
      case 'navbar':
        return isVisible('navbar') && <Navbar key="navbar" config={getConfig<NavbarConfig>('navbar')} />;
      case 'hero':
        return isVisible('hero') && <HeroSection key="hero" config={getConfig<HeroConfig>('hero')} />;
      case 'about':
        return isVisible('about') && <AboutSection key="about" config={getConfig<AboutConfig>('about')} />;
      case 'events':
        return isVisible('events') && <EventsSection key="events" config={getConfig<EventsConfig>('events')} />;
      case 'blog':
        return isVisible('blog') && <BlogSection key="blog" config={getConfig<BlogConfig>('blog')} />;
      case 'team':
        return isVisible('team') && <TeamSection key="team" config={getConfig<TeamConfig>('team')} />;
      case 'sponsors':
        return isVisible('sponsors') && <SponsorsSection key="sponsors" config={getConfig<SponsorsConfig>('sponsors')} />;
      case 'register':
        return isVisible('register') && <RegisterSection key="register" config={getConfig<RegisterConfig>('register')} />;
      case 'footer':
        return isVisible('footer') && <Footer key="footer" config={getConfig<FooterConfig>('footer')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar always at top */}
      {renderSection('navbar')}

      <main>
        {sortedSectionTypes
          .filter(type => type !== 'navbar' && type !== 'footer')
          .map(type => renderSection(type as SectionType))}
      </main>

      {/* Footer always at bottom */}
      {renderSection('footer')}
    </div>
  );
};

export default Index;
