import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Submissions from "./pages/Submissions";
import Earnings from "./pages/Earnings";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import Referrals from "./pages/Referrals";
import Withdrawals from "./pages/Withdrawals";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import RemoteJobs from "./pages/RemoteJobs";
import WatchAndEarn from "./pages/WatchAndEarn";
import WatchAndEarnTasks from "./pages/WatchAndEarnTasks";
import FollowAndEarnTasks from "./pages/FollowAndEarn";
import ReferAndEarn from "./pages/ReferAndEarn";
import AcademicWriting from "./pages/AcademicWriting";
import AITraining from "./pages/AITraining";

// Configure QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/withdrawals" element={<Withdrawals />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/remote-jobs" element={<RemoteJobs />} />
            <Route path="/watch-and-earn" element={<WatchAndEarn />} />
            <Route path="/watch-tasks" element={<WatchAndEarnTasks />} />
            <Route path="/follow-tasks" element={<FollowAndEarnTasks />} />
            <Route path="/refer-and-earn" element={<ReferAndEarn />} />
            <Route path="/academic-writing" element={<AcademicWriting />} />
            <Route path="/ai-training" element={<AITraining />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;