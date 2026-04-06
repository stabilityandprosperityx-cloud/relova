import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DashboardOverviewPage from "./pages/dashboard/DashboardOverviewPage.tsx";
import DashboardAdvisorPage from "./pages/dashboard/DashboardAdvisorPage.tsx";
import DashboardPlanPage from "./pages/dashboard/DashboardPlanPage.tsx";
import DashboardChecklistPage from "./pages/dashboard/DashboardChecklistPage.tsx";
import DashboardDocumentsPage from "./pages/dashboard/DashboardDocumentsPage.tsx";
import Countries from "./pages/Countries.tsx";
import Chat from "./pages/Chat.tsx";
import CountryPage from "./pages/CountryPage.tsx";
import Pricing from "./pages/Pricing.tsx";
import NotFound from "./pages/NotFound.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Refund from "./pages/Refund.tsx";
import MoveToPortugal from "./pages/blog/MoveToPortugal.tsx";
import PortugalVsSpain from "./pages/blog/PortugalVsSpain.tsx";
import BestCountries2026 from "./pages/blog/BestCountries2026.tsx";
import Help from "./pages/Help.tsx";
import Contact from "./pages/Contact.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { usePageTracking } from "./hooks/usePageTracking.ts";

const queryClient = new QueryClient();

const BLOG_ORIGIN = "https://blog.relova.ai";

function BlogExternalRedirect() {
  useEffect(() => {
    window.location.replace(BLOG_ORIGIN);
  }, []);
  return null;
}

function AppRoutes() {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="advisor" element={<DashboardAdvisorPage />} />
          <Route path="plan" element={<DashboardPlanPage />} />
          <Route path="checklist" element={<DashboardChecklistPage />} />
          <Route path="documents" element={<DashboardDocumentsPage />} />
        </Route>
        <Route path="/countries" element={<Countries />} />
        <Route path="/countries/:slug" element={<CountryPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/blog" element={<BlogExternalRedirect />} />
        <Route path="/guides/move-to-portugal" element={<MoveToPortugal />} />
        <Route path="/compare/portugal-vs-spain" element={<PortugalVsSpain />} />
        <Route path="/best/best-countries-2026" element={<BestCountries2026 />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
