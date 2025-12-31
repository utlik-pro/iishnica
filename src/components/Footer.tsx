import React from "react";
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from "@/types/pageBuilder";

interface FooterProps {
  config?: FooterConfig;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  const cfg = config ?? DEFAULT_FOOTER_CONFIG;
  const currentYear = new Date().getFullYear();

  const handleScrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (item: typeof cfg.navigation.items[0]) => {
    if (item.type === 'scroll') {
      if (item.target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleScrollToSection(item.target);
      }
    }
  };

  // Replace {year} placeholder with current year
  const copyrightText = cfg.copyright.replace('{year}', currentYear.toString());

  return (
    <footer className="bg-gray-50 border-t py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
          {/* Logo and tagline */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs md:text-sm">ИИ</span>
              </div>
              <span className="font-heading font-bold text-lg md:text-xl">{cfg.logo.title}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              {cfg.logo.tagline}
            </p>
          </div>

          {/* Navigation grid */}
          <div className="grid grid-cols-2 gap-6 md:gap-16 w-full md:w-auto">
            <div>
              <h3 className="font-medium mb-3 md:mb-4 text-sm md:text-base">{cfg.navigation.title}</h3>
              <ul className="space-y-1.5 md:space-y-2">
                {cfg.navigation.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item)}
                      className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3 md:mb-4 text-sm md:text-base">{cfg.contacts.title}</h3>
              <ul className="space-y-1.5 md:space-y-2">
                <li className="text-xs md:text-sm text-muted-foreground">
                  {cfg.contacts.email}
                </li>
                <li className="text-xs md:text-sm text-muted-foreground">
                  {cfg.contacts.phone}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            {copyrightText}
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {cfg.bottomLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScrollToSection(link.target)}
                className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
