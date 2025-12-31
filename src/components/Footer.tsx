import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              <span className="font-heading font-bold text-lg md:text-xl">ИИшница</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              Мероприятия от M.AI.N - AI Community
            </p>
          </div>

          {/* Navigation grid */}
          <div className="grid grid-cols-2 gap-6 md:gap-16 w-full md:w-auto">
            <div>
              <h3 className="font-medium mb-3 md:mb-4 text-sm md:text-base">Навигация</h3>
              <ul className="space-y-1.5 md:space-y-2">
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Главная
                  </button>
                </li>
                <li>
                  <button onClick={() => handleScrollToSection('about')} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    О комьюнити
                  </button>
                </li>
                <li>
                  <button onClick={() => handleScrollToSection('program')} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Программа
                  </button>
                </li>
                <li>
                  <button onClick={() => handleScrollToSection('team')} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                    Команда
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3 md:mb-4 text-sm md:text-base">Контакты</h3>
              <ul className="space-y-1.5 md:space-y-2">
                <li className="text-xs md:text-sm text-muted-foreground">
                  admin@utlik.pro
                </li>
                <li className="text-xs md:text-sm text-muted-foreground">
                  +375 44 755 4000
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} ИИшница. M.AI.N - AI Community
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <button onClick={() => handleScrollToSection('privacy')} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
              Политика конфиденциальности
            </button>
            <button onClick={() => handleScrollToSection('terms')} className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
              Условия использования
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
