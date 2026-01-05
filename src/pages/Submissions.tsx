import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  ExternalLink,
  Briefcase,
} from 'lucide-react';

interface Submission {
  id: string;
  submission_content: string;
  submission_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback: string | null;
  payment_amount: number;
  created_at: string;
  reviewed_at: string | null;
  job: {
    id: string;
    title: string;
    category: { name: string } | null;
  } | null;
}

const Submissions = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('job_submissions')
        .select(`
          id,
          submission_content,
          submission_url,
          status,
          admin_feedback,
          payment_amount,
          created_at,
          reviewed_at,
          job:jobs(id, title, category:job_categories(name))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setSubmissions(data as unknown as Submission[]);
      }
      setIsLoading(false);
    };

    fetchSubmissions();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Submissions</h1>
            <p className="text-muted-foreground mt-1">
              Track the status of your submitted work
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/jobs">Find More Jobs</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-xl font-bold text-foreground">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-xl font-bold text-foreground">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="glass-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(submission.status)}
                      <h3 className="font-semibold text-foreground">
                        {submission.job?.title || 'Unknown Job'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>{submission.job?.category?.name || 'General'}</span>
                      <span>
                        Submitted {new Date(submission.created_at).toLocaleDateString()}
                      </span>
                      {submission.reviewed_at && (
                        <span>
                          Reviewed {new Date(submission.reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {submission.admin_feedback && (
                      <div className="mt-3 p-3 rounded-lg bg-secondary/50">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Feedback: </span>
                          {submission.admin_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xl font-bold">{submission.payment_amount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {submission.status === 'approved' ? 'Earned' : 'Potential'}
                      </p>
                    </div>
                    {submission.submission_url && (
                      <a
                        href={submission.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No submissions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start working on jobs to see your submissions here
            </p>
            <Button variant="hero" asChild>
              <Link to="/jobs">Browse Available Jobs</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Submissions;
