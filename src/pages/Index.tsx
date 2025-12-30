
import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import BlogSection from "@/components/BlogSection";
import RegisterSection from "@/components/RegisterSection";
import TeamSection from "@/components/TeamSection";
import SponsorsSection from "@/components/SponsorsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <HeroSection />
        <AboutSection />
        <EventsSection />
        <BlogSection />
        <TeamSection />
        <SponsorsSection />
        <RegisterSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
