
import React from "react";
import { Button } from "@/components/ui/button";

interface AdminNavbarProps {
  username: string;
  onLogout: () => void;
  onHomeClick: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ username, onLogout, onHomeClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold gradient-text">ИИшница Админ</h2>
          <Button variant="ghost" onClick={onHomeClick}>На главную</Button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Вы вошли как <span className="font-medium text-foreground">{username}</span>
          </span>
          <Button variant="outline" onClick={onLogout}>Выйти</Button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
