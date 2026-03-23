import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

// Public pages - eagerly loaded (critical for SEO/first paint)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Public pages - lazy loaded (visited less frequently)
const LocalMapBooster = lazy(() => import("./pages/LocalMapBooster"));
const Websites = lazy(() => import("./pages/services/Websites"));
const SEO = lazy(() => import("./pages/services/SEO"));
const AdsContent = lazy(() => import("./pages/services/AdsContent"));
const ContentAds = lazy(() => import("./pages/services/ContentAds"));
const Outbound = lazy(() => import("./pages/services/Outbound"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const Careers = lazy(() => import("./pages/Careers"));
const WebsiteSubmissions = lazy(() => import("./pages/WebsiteSubmissions"));
const WebsiteSubmissionConfirmation = lazy(() => import("./pages/WebsiteSubmissionConfirmation"));
const FunnelSubmissions = lazy(() => import("./pages/FunnelSubmissions"));
const FunnelSubmissionConfirmation = lazy(() => import("./pages/FunnelSubmissionConfirmation"));
const Auth = lazy(() => import("./pages/Auth"));

// Protected/admin pages - always lazy loaded
const CallCenterKPI = lazy(() => import("./pages/CallCenterKPI"));
const SubmissionsDashboard = lazy(() => import("./pages/SubmissionsDashboard"));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard"));
const ApplicantTracker = lazy(() => import("./pages/ApplicantTracker"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ResellerPortal = lazy(() => import("./pages/ResellerPortal"));
const CDLAgencyPortal = lazy(() => import("./pages/CDLAgencyPortal"));
const IndividualClientProfile = lazy(() => import("./pages/IndividualClientProfile"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const TaskPipeline = lazy(() => import("./pages/TaskPipeline"));
const TeamTracker = lazy(() => import("./pages/TeamTracker"));
const WebsitePromptingPage = lazy(() => import("./pages/WebsitePromptingPage"));
const WebsiteBuilderDashboard = lazy(() => import("./pages/WebsiteBuilderDashboard"));
const WebsiteCommandCenter = lazy(() => import("./pages/WebsiteCommandCenter"));
const AvaVoiceCallsDashboard = lazy(() => import("./pages/AvaVoiceCallsDashboard"));
const AvaTrainingDashboard = lazy(() => import("./pages/AvaTrainingDashboard"));
const TaskFlow = lazy(() => import("./pages/TaskFlow"));
const ClientSitesTracker = lazy(() => import("./pages/ClientSitesTracker"));
const ContentPortal = lazy(() => import("./pages/ContentPortal"));
const ManagerPortal = lazy(() => import("./pages/ManagerPortal"));
const EditorPortal = lazy(() => import("./pages/EditorPortal"));
const TeamAccess = lazy(() => import("./pages/TeamAccess"));
const TeamPortal = lazy(() => import("./pages/TeamPortal"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const GBPManagement = lazy(() => import("./pages/GBPManagement"));
const PTOCalendar = lazy(() => import("./pages/PTOCalendar"));
const TeamTasks = lazy(() => import("./pages/TeamTasks"));

// AVA by Rank Me Higher Pages - lazy loaded
const SEOSpiderDashboard = lazy(() => import("./pages/seo-spider/Dashboard"));
const SEOSpiderAIAssistant = lazy(() => import("./pages/seo-spider/AIAssistant"));
const SEOSpiderAnalytics = lazy(() => import("./pages/seo-spider/Analytics"));
const SEOSpiderBilling = lazy(() => import("./pages/seo-spider/Billing"));
const SEOSpiderBlogs = lazy(() => import("./pages/seo-spider/Blogs"));
const SEOSpiderCompany = lazy(() => import("./pages/seo-spider/Company"));
const SEOSpiderContacts = lazy(() => import("./pages/seo-spider/Contacts"));
const SEOSpiderLocalRankings = lazy(() => import("./pages/seo-spider/LocalRankings"));
const SEOSpiderOnboarding = lazy(() => import("./pages/seo-spider/Onboarding"));
const SEOSpiderPricing = lazy(() => import("./pages/seo-spider/Pricing"));
const SEOSpiderReviews = lazy(() => import("./pages/seo-spider/Reviews"));
const SEOSpiderServiceAreas = lazy(() => import("./pages/seo-spider/ServiceAreas"));
const SEOSpiderSettings = lazy(() => import("./pages/seo-spider/Settings"));
const SEOSpiderAdmin = lazy(() => import("./pages/seo-spider/AdminDashboard"));

// Chatbot - lazy loaded (not needed for first paint)
const Chatbot = lazy(() => import("./components/Chatbot"));

const queryClient = new QueryClient();

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/localmapbooster" element={<LocalMapBooster />} />
                <Route path="/services/websites" element={<Websites />} />
                <Route path="/services/seo" element={<SEO />} />
                <Route path="/services/ads-content" element={<AdsContent />} />
                <Route path="/services/content-ads" element={<ContentAds />} />
                <Route path="/services/outbound" element={<Outbound />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/website-submissions" element={<WebsiteSubmissions />} />
                <Route path="/website-submission-confirmation" element={<WebsiteSubmissionConfirmation />} />
                <Route path="/funnel-submissions" element={<FunnelSubmissions />} />
                <Route path="/funnel-submission-confirmation" element={<FunnelSubmissionConfirmation />} />

                {/* Protected routes - require authentication */}
                <Route path="/call-center-kpi" element={
                  <ProtectedRoute teamPermission="call-center-kpi">
                    <CallCenterKPI />
                  </ProtectedRoute>
                } />
                <Route path="/submissions-dashboard" element={
                  <ProtectedRoute requireAdmin>
                    <SubmissionsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/agency-dashboard" element={
                  <ProtectedRoute requireAdmin>
                    <AgencyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/avaadminpanel" element={
                  <ProtectedRoute requireAdmin>
                    <AgencyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/team" element={<TeamPortal />} />
                <Route path="/cdl-agency-portal" element={
                  <ProtectedRoute requireAdmin>
                    <CDLAgencyPortal />
                  </ProtectedRoute>
                } />
                <Route path="/cdl-recruiters" element={
                  <ProtectedRoute requireAdmin>
                    <CDLAgencyPortal />
                  </ProtectedRoute>
                } />
                <Route path="/cdl-carriers" element={
                  <ProtectedRoute requireAdmin>
                    <CDLAgencyPortal />
                  </ProtectedRoute>
                } />
                <Route path="/agency/client/:id" element={
                  <ProtectedRoute requireAdmin>
                    <IndividualClientProfile />
                  </ProtectedRoute>
                } />
                <Route path="/subscriptions" element={
                  <ProtectedRoute teamPermission="subscriptions">
                    <Subscriptions />
                  </ProtectedRoute>
                } />
                <Route path="/website-prompting" element={
                  <ProtectedRoute teamPermission="build-website">
                    <WebsitePromptingPage />
                  </ProtectedRoute>
                } />
                <Route path="/website-builder" element={
                  <ProtectedRoute requireAdmin>
                    <WebsiteBuilderDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/website-command-center" element={
                  <ProtectedRoute requireAdmin>
                    <WebsiteCommandCenter />
                  </ProtectedRoute>
                } />
                {/* Agency Portal (previously Client Portal) - accessible by admins and resellers */}
                <Route path="/client-portal" element={
                  <ProtectedRoute allowReseller teamPermission="client-portal">
                    <ClientPortal />
                  </ProtectedRoute>
                } />
                {/* Client Dashboard - accessible by admins and resellers */}
                <Route path="/client-dashboard" element={
                  <ProtectedRoute allowReseller>
                    <ClientDashboard />
                  </ProtectedRoute>
                } />
                {/* Reseller Portal - accessible by admins and resellers */}
                <Route path="/reseller-portal" element={
                  <ProtectedRoute allowReseller>
                    <ResellerPortal />
                  </ProtectedRoute>
                } />
                <Route path="/ava-voice-calls" element={
                  <ProtectedRoute requireAdmin>
                    <AvaVoiceCallsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/ava-training" element={
                  <ProtectedRoute requireAdmin>
                    <AvaTrainingDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/task-flow" element={
                  <ProtectedRoute requireAdmin>
                    <TaskFlow />
                  </ProtectedRoute>
                } />
                <Route path="/applicant-tracker" element={
                  <ProtectedRoute requireAdmin teamPermission="applicant-tracker">
                    <ApplicantTracker />
                  </ProtectedRoute>
                } />
                <Route path="/content-portal" element={
                  <ProtectedRoute requireAdmin teamPermission="content-portal">
                    <ContentPortal />
                  </ProtectedRoute>
                } />
                <Route path="/manager-portal" element={<ManagerPortal />} />
                <Route path="/editor-portal" element={<EditorPortal />} />
                <Route path="/gbpmanagement" element={
                  <ProtectedRoute requireAdmin teamPermission="gbp-management">
                    <GBPManagement />
                  </ProtectedRoute>
                } />
                <Route path="/pto-calendar" element={
                  <ProtectedRoute requireAdmin teamPermission="pto-calendar">
                    <PTOCalendar />
                  </ProtectedRoute>
                } />
                <Route path="/team-tasks" element={
                  <ProtectedRoute teamPermission="team-tasks">
                    <TeamTasks />
                  </ProtectedRoute>
                } />
                <Route path="/team-access" element={
                  <ProtectedRoute requireAdmin>
                    <TeamAccess />
                  </ProtectedRoute>
                } />
                <Route path="/team-portal" element={<Navigate to="/team" replace />} />
                <Route path="/avaseo" element={<ProtectedRoute><SEOSpiderDashboard /></ProtectedRoute>} />
                <Route path="/avaseo/ai-assistant" element={<ProtectedRoute><SEOSpiderAIAssistant /></ProtectedRoute>} />
                <Route path="/avaseo/analytics" element={<ProtectedRoute><SEOSpiderAnalytics /></ProtectedRoute>} />
                <Route path="/avaseo/billing" element={<ProtectedRoute><SEOSpiderBilling /></ProtectedRoute>} />
                <Route path="/avaseo/blogs" element={<ProtectedRoute><SEOSpiderBlogs /></ProtectedRoute>} />
                <Route path="/avaseo/company" element={<ProtectedRoute><SEOSpiderCompany /></ProtectedRoute>} />
                <Route path="/avaseo/contacts" element={<ProtectedRoute><SEOSpiderContacts /></ProtectedRoute>} />
                <Route path="/avaseo/local-rankings" element={<ProtectedRoute><SEOSpiderLocalRankings /></ProtectedRoute>} />
                <Route path="/avaseo/onboarding" element={<ProtectedRoute><SEOSpiderOnboarding /></ProtectedRoute>} />
                <Route path="/avaseo/pricing" element={<SEOSpiderPricing />} />
                <Route path="/avaseo/reviews" element={<ProtectedRoute><SEOSpiderReviews /></ProtectedRoute>} />
                <Route path="/avaseo/service-areas" element={<ProtectedRoute><SEOSpiderServiceAreas /></ProtectedRoute>} />
                <Route path="/avaseo/settings" element={<ProtectedRoute><SEOSpiderSettings /></ProtectedRoute>} />
                <Route path="/avaseo/admin" element={<ProtectedRoute requireAdmin><SEOSpiderAdmin /></ProtectedRoute>} />

                {/* Task Management Routes */}
                <Route path="/task-pipeline" element={
                  <ProtectedRoute requireAdmin>
                    <TaskPipeline />
                  </ProtectedRoute>
                } />
                <Route path="/team-tracker" element={
                  <ProtectedRoute teamPermission="team-tracker">
                    <TeamTracker />
                  </ProtectedRoute>
                } />
                <Route path="/client-sites-tracker" element={
                  <ProtectedRoute requireAdmin>
                    <ClientSitesTracker />
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
            </Suspense>
            <Suspense fallback={null}>
              <Chatbot />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
