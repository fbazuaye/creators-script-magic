import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/AppShell";
import Index from "@/pages/Index";
import ScriptGenerator from "@/pages/ScriptGenerator";
import ThumbnailGenerator from "@/pages/ThumbnailGenerator";
import Projects from "@/pages/Projects";
import BuyCredits from "@/pages/BuyCredits";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<AppShell />}>
            <Route path="/create" element={<ScriptGenerator />} />
            <Route path="/thumbnails" element={<ThumbnailGenerator />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/buy-credits" element={<BuyCredits />} />
          </Route>
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
