import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Главная", action: () => handleScrollToTop() },
    { label: "О комьюнити", action: () => handleScrollToSection('about') },
    { label: "Программа", action: () => handleScrollToSection('program') },
    { label: "Команда", action: () => handleScrollToSection('team') },
    { label: "Календарь", href: "/calendar" },
    { label: "Блог", href: "/blog" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 md:space-x-3">
          <img
            src="/Main-logo.webp"
            alt="M.AI.N Community Logo"
            className="h-8 md:h-10 w-auto"
          />
          <span className="font-heading font-bold text-lg md:text-xl">ИИшница</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            link.href ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={link.action}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            )
          ))}
        </nav>

        {/* Desktop CTA + Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-xs sm:text-sm px-3 sm:px-4"
            onClick={() => window.open('https://t.me/maincomby_bot', '_blank')}
          >
            Регистрация
          </Button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-1">
            {navLinks.map((link) => (
              link.href ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors text-left"
                >
                  {link.label}
                </button>
              )
            ))}

            {/* Mobile CTA */}
            <div className="pt-4 border-t mt-2">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  window.open('https://t.me/maincomby_bot', '_blank');
                  setMobileMenuOpen(false);
                }}
              >
                Зарегистрироваться
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
