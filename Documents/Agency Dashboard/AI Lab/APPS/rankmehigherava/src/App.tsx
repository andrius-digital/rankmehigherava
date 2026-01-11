import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LocalMapBooster from "./pages/LocalMapBooster";
import Websites from "./pages/services/Websites";
import SEO from "./pages/services/SEO";
import AdsContent from "./pages/services/AdsContent";
import Outbound from "./pages/services/Outbound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CallCenterKPI from "./pages/CallCenterKPI";
import SubmissionsDashboard from "./pages/SubmissionsDashboard";
import WebsiteSubmissions from "./pages/WebsiteSubmissions";
import ClientProfile from "./pages/ClientProfile";
import AgencyDashboard from "./pages/AgencyDashboard";
import ClientPortal from "./pages/ClientPortal";
import CDLAgencyPortal from "./pages/CDLAgencyPortal";
import WebsiteSubmissionConfirmation from "./pages/WebsiteSubmissionConfirmation";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";
import Subscriptions from "./pages/Subscriptions";
import TaskPipeline from "./pages/TaskPipeline";
import TeamTracker from "./pages/TeamTracker";
import WebsitePromptingPage from "./pages/WebsitePromptingPage";
import WebsiteBuilderDashboard from "./pages/WebsiteBuilderDashboard";
import WebsiteCommandCenter from "./pages/WebsiteCommandCenter";

// AVA by Rank Me Higher Pages
import SEOSpiderDashboard from "./pages/seo-spider/Dashboard";
import SEOSpiderAIAssistant from "./pages/seo-spider/AIAssistant";
import SEOSpiderAnalytics from "./pages/seo-spider/Analytics";
import SEOSpiderBilling from "./pages/seo-spider/Billing";
import SEOSpiderBlogs from "./pages/seo-spider/Blogs";
import SEOSpiderCompany from "./pages/seo-spider/Company";
import SEOSpiderContacts from "./pages/seo-spider/Contacts";
import SEOSpiderLocalRankings from "./pages/seo-spider/LocalRankings";
import SEOSpiderOnboarding from "./pages/seo-spider/Onboarding";
import SEOSpiderPricing from "./pages/seo-spider/Pricing";
import SEOSpiderReviews from "./pages/seo-spider/Reviews";
import SEOSpiderServiceAreas from "./pages/seo-spider/ServiceAreas";
import SEOSpiderSettings from "./pages/seo-spider/Settings";
import SEOSpiderAdmin from "./pages/seo-spider/AdminDashboard";

import ParticlesOverlay from "@/components/ui/ParticlesOverlay";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ParticlesOverlay />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/localmapbooster" element={<LocalMapBooster />} />
              <Route path="/services/websites" element={<Websites />} />
              <Route path="/services/seo" element={<SEO />} />
              <Route path="/services/ads-content" element={<AdsContent />} />
              <Route path="/services/outbound" element={<Outbound />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/website-submissions" element={<WebsiteSubmissions />} />
              <Route path="/website-submission-confirmation" element={<WebsiteSubmissionConfirmation />} />

              {/* Protected routes - require authentication */}
              <Route path="/call-center-kpi" element={
                <ProtectedRoute>
                  <CallCenterKPI />
                </ProtectedRoute>
              } />
              <Route path="/submissions-dashboard" element={
                <ProtectedRoute requireAdmin>
                  <SubmissionsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/agency-dashboard" element={
                <ProtectedRoute>
                  <AgencyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/avaadminpanel" element={
                <ProtectedRoute>
                  <AgencyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/cdl-agency-portal" element={
                <ProtectedRoute>
                  <CDLAgencyPortal />
                </ProtectedRoute>
              } />
              <Route path="/agency/client/:id" element={
                <ProtectedRoute>
                  <ClientProfile />
                </ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              } />
              <Route path="/website-prompting" element={
                <ProtectedRoute>
                  <WebsitePromptingPage />
                </ProtectedRoute>
              } />
              <Route path="/website-builder" element={
                <ProtectedRoute>
                  <WebsiteBuilderDashboard />
                </ProtectedRoute>
              } />
              <Route path="/website-command-center" element={
                <ProtectedRoute>
                  <WebsiteCommandCenter />
                </ProtectedRoute>
              } />
              {/* Redirect old client-portal to new agency-dashboard */}
              <Route path="/client-portal" element={
                <ProtectedRoute>
                  <ClientPortal />
                </ProtectedRoute>
              } />







              {/* Task Management Routes */}
              <Route path="/task-pipeline" element={
                <ProtectedRoute>
                  <TaskPipeline />
                </ProtectedRoute>
              } />
              <Route path="/team-tracker" element={
                <ProtectedRoute>
                  <TeamTracker />
                </ProtectedRoute>
              } />

              {/* AVA by Rank Me Higher Routes */}
              <Route path="/avabyrankmehigher" element={<ProtectedRoute><SEOSpiderDashboard /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/ai-assistant" element={<ProtectedRoute><SEOSpiderAIAssistant /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/analytics" element={<ProtectedRoute><SEOSpiderAnalytics /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/billing" element={<ProtectedRoute><SEOSpiderBilling /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/blogs" element={<ProtectedRoute><SEOSpiderBlogs /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/company" element={<ProtectedRoute><SEOSpiderCompany /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/contacts" element={<ProtectedRoute><SEOSpiderContacts /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/local-rankings" element={<ProtectedRoute><SEOSpiderLocalRankings /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/onboarding" element={<ProtectedRoute><SEOSpiderOnboarding /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/pricing" element={<SEOSpiderPricing />} />
              <Route path="/avabyrankmehigher/reviews" element={<ProtectedRoute><SEOSpiderReviews /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/service-areas" element={<ProtectedRoute><SEOSpiderServiceAreas /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/settings" element={<ProtectedRoute><SEOSpiderSettings /></ProtectedRoute>} />
              <Route path="/avabyrankmehigher/admin" element={<ProtectedRoute requireAdmin><SEOSpiderAdmin /></ProtectedRoute>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Chatbot />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
