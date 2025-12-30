
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Calendar from "./pages/Calendar";
import EventPage from "./pages/EventPage";
import EventDetail from "./pages/EventDetail";
import EventGrodno from "./pages/EventGrodno";
import EventDecember18 from "./pages/EventDecember18";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { setupInitialData } from "./integrations/supabase/setup";

const queryClient = new QueryClient();

const App = () => {
  // Initialize default data on app start
  useEffect(() => {
    setupInitialData().catch(console.error);
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/event/:id" element={<EventPage />} />
              {/* Legacy event routes */}
              <Route path="/event/evening-november-25" element={<EventDetail />} />
              <Route path="/event/evening-grodno-november-20" element={<EventGrodno />} />
              <Route path="/event/december-18" element={<EventDecember18 />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
