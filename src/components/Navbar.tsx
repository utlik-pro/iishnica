import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { NavbarConfig, DEFAULT_NAVBAR_CONFIG } from "@/types/pageBuilder";

interface NavbarProps {
  config?: NavbarConfig;
}

const Navbar: React.FC<NavbarProps> = ({ config }) => {
  const cfg = config ?? DEFAULT_NAVBAR_CONFIG;
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

  const handleMenuItemClick = (item: typeof cfg.menuItems[0]) => {
    if (item.type === 'scroll') {
      if (item.target === 'top') {
        handleScrollToTop();
      } else {
        handleScrollToSection(item.target);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 md:space-x-3">
          <img
            src={cfg.logo.imageUrl}
            alt="Logo"
            className="h-8 md:h-10 w-auto"
          />
          <span className="font-heading font-bold text-lg md:text-xl">{cfg.logo.title}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {cfg.menuItems.map((item) => (
            item.type === 'link' ? (
              <Link
                key={item.id}
                to={item.target}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            )
          ))}
        </nav>

        {/* Desktop CTA + Mobile Menu Button */}
        <div className="flex items-center gap-2">
          {cfg.ctaButton.isVisible && (
            <Button
              size="sm"
              className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-xs sm:text-sm px-3 sm:px-4"
              onClick={() => window.open(cfg.ctaButton.url, '_blank')}
            >
              {cfg.ctaButton.text}
            </Button>
          )}

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
            {cfg.menuItems.map((item) => (
              item.type === 'link' ? (
                <Link
                  key={item.id}
                  to={item.target}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="py-3 px-4 text-base font-medium hover:bg-muted rounded-lg transition-colors text-left"
                >
                  {item.label}
                </button>
              )
            ))}

            {/* Mobile CTA */}
            {cfg.ctaButton.isVisible && (
              <div className="pt-4 border-t mt-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => {
                    window.open(cfg.ctaButton.url, '_blank');
                    setMobileMenuOpen(false);
                  }}
                >
                  {cfg.ctaButton.text}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
