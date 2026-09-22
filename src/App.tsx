import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { usePageTracking } from "./hooks/usePageTracking.ts";

// Every route below is code-split with React.lazy: previously all ~40 routes
// (dashboard, chat, every tool, every legal page) were bundled into one ~1.5MB
// JS file loaded on every single page view, including the 63 prerendered
// /countries/<slug> pages and every /tools/* page that only need their own
// route's code. Splitting per-route cuts the JS each page view has to
// download/parse/execute, which is what Core Web Vitals (TBT, INP) and
// mobile load time actually measure — the static prerendered HTML already
// covers first paint, so this only affects hydration weight, not SEO content.
const Index = lazy(() => import("./pages/Index.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const DashboardOverviewPage = lazy(() => import("./pages/dashboard/DashboardOverviewPage.tsx"));
const DashboardAdvisorPage = lazy(() => import("./pages/dashboard/DashboardAdvisorPage.tsx"));
const DashboardPlanPage = lazy(() => import("./pages/dashboard/DashboardPlanPage.tsx"));
const DashboardChecklistPage = lazy(() => import("./pages/dashboard/DashboardChecklistPage.tsx"));
const DashboardDocumentsPage = lazy(() => import("./pages/dashboard/DashboardDocumentsPage.tsx"));
const DashboardCountriesPage = lazy(() => import("./pages/dashboard/DashboardCountriesPage.tsx"));
const Countries = lazy(() => import("./pages/Countries.tsx"));
const Chat = lazy(() => import("./pages/Chat.tsx"));
const CountryPage = lazy(() => import("./pages/CountryPage.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Refund = lazy(() => import("./pages/Refund.tsx"));
const MoveToPortugal = lazy(() => import("./pages/blog/MoveToPortugal.tsx"));
const PortugalVsSpain = lazy(() => import("./pages/blog/PortugalVsSpain.tsx"));
const BestCountries2026 = lazy(() => import("./pages/blog/BestCountries2026.tsx"));
const Help = lazy(() => import("./pages/Help.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Mission = lazy(() => import("./pages/Mission.tsx"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy.tsx"));
const DataSecurity = lazy(() => import("./pages/DataSecurity.tsx"));
const Compliance = lazy(() => import("./pages/Compliance.tsx"));
const ToolsHub = lazy(() => import("./pages/tools/ToolsHub.tsx"));
const CanIMoveHub = lazy(() => import("./pages/tools/CanIMoveHub.tsx"));
const CanIMove = lazy(() => import("./pages/tools/CanIMove.tsx"));
const MoveAsHub = lazy(() => import("./pages/tools/MoveAsHub.tsx"));
const MoveAsPersona = lazy(() => import("./pages/tools/MoveAsPersona.tsx"));
const DocumentsNeededHub = lazy(() => import("./pages/tools/DocumentsNeededHub.tsx"));
const DocumentsNeeded = lazy(() => import("./pages/tools/DocumentsNeeded.tsx"));
const CountryCompareHub = lazy(() => import("./pages/tools/CountryCompareHub.tsx"));
const CountryCompare = lazy(() => import("./pages/tools/CountryCompare.tsx"));
const InvitationLetter = lazy(() => import("./pages/tools/InvitationLetter.tsx"));
const TaxResidencyTracker = lazy(() => import("./pages/tools/TaxResidencyTracker.tsx"));
const DataSources = lazy(() => import("./pages/DataSources.tsx"));

const queryClient = new QueryClient();

const BLOG_ORIGIN = "https://blog.relova.ai";

function BlogExternalRedirect() {
  useEffect(() => {
    window.location.replace(BLOG_ORIGIN);
  }, []);
  return null;
}

function BlogSlugRedirect() {
  useEffect(() => {
    const slug = window.location.pathname.replace(/^\/blog\//, "");
    window.location.replace(`https://blog.relova.ai/blog/${slug}`);
  }, []);
  return null;
}

function AppRoutes() {
  usePageTracking();
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="advisor" element={<DashboardAdvisorPage />} />
          <Route path="plan" element={<DashboardPlanPage />} />
          <Route path="checklist" element={<DashboardChecklistPage />} />
          <Route path="documents" element={<DashboardDocumentsPage />} />
          <Route path="countries" element={<DashboardCountriesPage />} />
        </Route>
        <Route path="/countries" element={<Countries />} />
        <Route path="/countries/:slug" element={<CountryPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/blog" element={<BlogExternalRedirect />} />
        <Route path="/blog/*" element={<BlogSlugRedirect />} />
        <Route path="/guides/move-to-portugal" element={<MoveToPortugal />} />
        <Route path="/compare/portugal-vs-spain" element={<PortugalVsSpain />} />
        <Route path="/best/best-countries-2026" element={<BestCountries2026 />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/mission" element={<Mission />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/data-security" element={<DataSecurity />} />
        <Route path="/data-sources" element={<DataSources />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/tools" element={<ToolsHub />} />
        <Route path="/tools/can-i-move" element={<CanIMoveHub />} />
        <Route path="/tools/can-i-move/:citizenshipSlug/:destinationSlug" element={<CanIMove />} />
        <Route path="/tools/where-should-i-move" element={<MoveAsHub />} />
        <Route path="/tools/where-should-i-move/:personaSlug" element={<MoveAsPersona />} />
        <Route path="/tools/documents-needed" element={<DocumentsNeededHub />} />
        <Route path="/tools/documents-needed/:citizenshipSlug/:destinationSlug" element={<DocumentsNeeded />} />
        <Route path="/tools/country-compare" element={<CountryCompareHub />} />
        <Route path="/tools/country-compare/:countryASlug/:countryBSlug" element={<CountryCompare />} />
        <Route path="/tools/country-compare/:citizenshipSlug/:countryASlug/:countryBSlug" element={<CountryCompare />} />
        <Route path="/tools/invitation-letter" element={<InvitationLetter />} />
        <Route path="/tools/invitation-letter/:variant" element={<InvitationLetter />} />
        <Route path="/tools/tax-residency-tracker" element={<TaxResidencyTracker />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
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
