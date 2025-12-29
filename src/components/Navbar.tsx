import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  // Function to handle smooth scrolling to a section
  const handleScrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="/Main-logo.webp"
            alt="M.AI.N Community Logo"
            className="h-10 w-auto"
          />
          <span className="font-heading font-bold text-xl">ИИшница</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Главная</a>
          {/* Use onClick to scroll for hash links */}
          <Link to="#about" onClick={(e) => { e.preventDefault(); handleScrollToSection('about'); }} className="text-sm font-medium hover:text-primary transition-colors">О комьюнити</Link>
          <Link to="#program" onClick={(e) => { e.preventDefault(); handleScrollToSection('program'); }} className="text-sm font-medium hover:text-primary transition-colors">Программа</Link>
          <Link to="#team" onClick={(e) => { e.preventDefault(); handleScrollToSection('team'); }} className="text-sm font-medium hover:text-primary transition-colors">Команда</Link>
          <Link to="/calendar" className="text-sm font-medium hover:text-primary transition-colors">Календарь</Link>
        </nav>

        <div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => window.open('https://t.me/maincomby_bot', '_blank')}
          >
            Зарегистрироваться
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
