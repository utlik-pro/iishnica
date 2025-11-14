
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminLogin from "@/components/admin/AdminLogin";
import EventsManager from "@/components/admin/EventsManager";
import SponsorsManager from "@/components/admin/SponsorsManager";
import LeadsManager from "@/components/admin/LeadsManager";

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем авторизацию при загрузке страницы
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (token) {
          const userData = JSON.parse(token);
          if (userData && userData.username) {
            setIsAuthenticated(true);
            setUsername(userData.username);
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = (loggedInUsername: string) => {
    setIsAuthenticated(true);
    setUsername(loggedInUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setUsername("");
  };

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar username={username} onLogout={handleLogout} onHomeClick={() => navigate("/")} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>
        
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="events">Завтраки</TabsTrigger>
            <TabsTrigger value="leads">Участники</TabsTrigger>
            <TabsTrigger value="sponsors">Спонсоры</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <EventsManager />
          </TabsContent>
          
          <TabsContent value="leads">
            <LeadsManager />
          </TabsContent>
          
          <TabsContent value="sponsors">
            <SponsorsManager />
          </TabsContent>
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  );
};

export default Admin;
