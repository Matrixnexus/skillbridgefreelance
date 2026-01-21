import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Crown,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  payment_amount: number;
  difficulty: string;
  required_tier: string;
  category: { name: string } | null;
}

interface PaymentSummary {
  pending: number;
  total: number;
  approved: number;
  rejected: number;
}

const DashboardHome = () => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(authProfile);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    pending: 0,
    total: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        // Fetch updated profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);

        // Fetch recent jobs
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('id, title, payment_amount, difficulty, required_tier, category:job_categories(name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (jobsData) setRecentJobs(jobsData as unknown as Job[]);

        // Fetch submissions for payment summary
        const { data: submissions } = await supabase
          .from('job_submissions')
          .select('status, payment_amount')
          .eq('user_id', user.id);

        if (submissions) {
          const summary = submissions.reduce(
            (acc, sub) => {
              acc.total += sub.payment_amount || 0;
              switch (sub.status) {
                case 'pending':
                  acc.pending += sub.payment_amount || 0;
                  break;
                case 'approved':
                  acc.approved += sub.payment_amount || 0;
                  break;
                case 'rejected':
                  acc.rejected += sub.payment_amount || 0;
                  break;
              }
              return acc;
            },
            { pending: 0, total: 0, approved: 0, rejected: 0 }
          );
          setPaymentSummary(summary);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getDailyTaskLimit = () => {
    switch (profile?.membership_tier) {
      case 'vip':
        return 'Unlimited';
      case 'pro':
        return 6;
      case 'regular':
        return 4;
      default:
        return 0;
    }
  };

  const getTasksRemaining = () => {
    const limit = getDailyTaskLimit();
    if (limit === 'Unlimited') return 'Unlimited';
    if (typeof limit === 'number') {
      return Math.max(0, limit - (profile?.daily_tasks_used || 0));
    }
    return 0;
  };

  const stats = [
    {
      name: 'Total Earnings',
      value: `$${paymentSummary.total.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      name: 'Pending Earnings',
      value: `$${paymentSummary.pending.toFixed(2)}`,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      name: 'Tasks Completed',
      value: profile?.tasks_completed || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      name: 'Tasks Today',
      value: `${profile?.daily_tasks_used || 0} / ${getDailyTaskLimit()}`,
      icon: Briefcase,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 bg-green-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'hard':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-muted-foreground bg-secondary';
    }
  };

  const canAccessJob = (requiredTier: string) => {
    const tierHierarchy = ['none', 'regular', 'pro', 'vip'];
    const userTierIndex = tierHierarchy.indexOf(profile?.membership_tier || 'none');
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
    return userTierIndex >= requiredTierIndex;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your freelancing activity
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/jobs">
            Browse Jobs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Membership Alert */}
      {profile?.membership_tier === 'none' && (
        <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Upgrade Your Membership
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                You're currently on the free tier. Upgrade to access jobs, earn money, and unlock premium features.
              </p>
              <Button variant="hero" size="sm" asChild>
                <Link to="/pricing">View Membership Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-xl lg:text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Jobs */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/jobs">
                <Briefcase className="w-4 h-4 mr-3" />
                Find New Jobs
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/submissions">
                <Clock className="w-4 h-4 mr-3" />
                View Submissions
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/earnings">
                <TrendingUp className="w-4 h-4 mr-3" />
                Earnings Report
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/settings">
                <Zap className="w-4 h-4 mr-3" />
                Account Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Jobs</h2>
            <Link to="/jobs" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className={`flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors ${
                    !canAccessJob(job.required_tier) ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">{job.title}</h3>
                      {!canAccessJob(job.required_tier) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">
                          {job.required_tier.toUpperCase()} only
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{job.category?.name || 'General'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(job.difficulty)}`}>
                        {job.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-primary">${job.payment_amount}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No jobs available at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
