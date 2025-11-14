import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Function to handle smooth scrolling to a section
  const handleScrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <footer className="bg-gray-50 border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">ИИ</span>
              </div>
              <span className="font-heading font-bold text-xl">ИИшница</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Мероприятия от M.AI.N - AI Community
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h3 className="font-medium mb-4">Навигация</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Главная</a>
                </li>
                <li>
                  <Link to="#about" onClick={(e) => { e.preventDefault(); handleScrollToSection('about'); }} className="text-sm font-medium hover:text-primary transition-colors">О комьюнити</Link>
                </li>
                <li>
                  <Link to="#program" onClick={(e) => { e.preventDefault(); handleScrollToSection('program'); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">Программа</Link>
                </li>
                <li>
                  <Link to="#team" onClick={(e) => { e.preventDefault(); handleScrollToSection('team'); }} className="text-sm text-muted-foreground hover:text-primary transition-colors">Команда</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Контакты</h3>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">
                  admin@utlik.pro
                </li>
                <li className="text-sm text-muted-foreground">
                  +375 44 755 4000
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ИИшница. M.AI.N - AI Community. Все права защищены.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#privacy" onClick={(e) => { e.preventDefault(); handleScrollToSection('privacy'); }} className="text-muted-foreground hover:text-primary transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="#terms" onClick={(e) => { e.preventDefault(); handleScrollToSection('terms'); }} className="text-muted-foreground hover:text-primary transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
