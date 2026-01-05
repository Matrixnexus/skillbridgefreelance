import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  Send,
  Lock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  instructions: string;
  payment_amount: number;
  difficulty: string;
  required_tier: string;
  estimated_time: string | null;
  deadline: string | null;
  submission_format: string | null;
  max_submissions: number | null;
  current_submissions: number;
  category: { name: string } | null;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      const { data: jobData } = await supabase
        .from('jobs')
        .select('*, category:job_categories(name)')
        .eq('id', id)
        .single();

      if (jobData) {
        setJob(jobData as unknown as Job);
      }

      // Check if user has already submitted
      if (user) {
        const { data: submissionData } = await supabase
          .from('job_submissions')
          .select('id')
          .eq('job_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setHasSubmitted(!!submissionData);
      }

      setIsLoading(false);
    };

    fetchJob();
  }, [id, user]);

  const canAccessJob = () => {
    if (!job || !profile) return false;
    const tierHierarchy = ['none', 'regular', 'pro', 'vip'];
    const userTierIndex = tierHierarchy.indexOf(profile.membership_tier);
    const requiredTierIndex = tierHierarchy.indexOf(job.required_tier);
    return userTierIndex >= requiredTierIndex;
  };

  const canSubmit = () => {
    if (!profile || !job) return false;
    if (profile.membership_tier === 'none') return false;
    if (hasSubmitted) return false;
    
    // Check daily limit
    const dailyLimit = profile.membership_tier === 'vip' ? Infinity :
      profile.membership_tier === 'pro' ? 6 : 4;
    if (profile.daily_tasks_used >= dailyLimit) return false;
    
    return canAccessJob();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job || !canSubmit()) return;

    setIsSubmitting(true);

    const { error } = await supabase.from('job_submissions').insert({
      job_id: job.id,
      user_id: user.id,
      submission_content: submissionContent,
      submission_url: submissionUrl || null,
      payment_amount: job.payment_amount,
    });

    if (error) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Update daily tasks used
      await supabase
        .from('profiles')
        .update({ daily_tasks_used: (profile?.daily_tasks_used || 0) + 1 })
        .eq('id', user.id);

      toast({
        title: 'Submission Successful',
        description: 'Your work has been submitted for review.',
      });
      setHasSubmitted(true);
    }

    setIsSubmitting(false);
  };

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

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">This job may have been removed or doesn't exist.</p>
          <Button variant="outline" asChild>
            <Link to="/jobs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="glass-card p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{job.title}</h1>
                {!canAccessJob() && (
                  <Lock className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                  {job.category?.name || 'General'}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full ${getDifficultyColor(job.difficulty)}`}>
                  {job.difficulty}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {job.required_tier.toUpperCase()} tier
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary">
                <DollarSign className="w-6 h-6" />
                <span className="text-3xl font-bold">{job.payment_amount}</span>
              </div>
              <p className="text-sm text-muted-foreground">per submission</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-secondary/30">
            {job.estimated_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{job.estimated_time}</span>
              </div>
            )}
            {job.submission_format && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{job.submission_format}</span>
              </div>
            )}
            {job.max_submissions && (
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Spots: </span>
                {job.current_submissions}/{job.max_submissions}
              </div>
            )}
            {job.deadline && (
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Deadline: </span>
                {new Date(job.deadline).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Instructions</h2>
              <p className="text-foreground whitespace-pre-wrap">{job.instructions}</p>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        {!canAccessJob() ? (
          <div className="glass-card p-6 text-center">
            <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Upgrade Required
            </h3>
            <p className="text-muted-foreground mb-4">
              This job requires a {job.required_tier.toUpperCase()} membership or higher.
            </p>
            <Button variant="hero" asChild>
              <Link to="/pricing">View Membership Plans</Link>
            </Button>
          </div>
        ) : hasSubmitted ? (
          <div className="glass-card p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Already Submitted
            </h3>
            <p className="text-muted-foreground mb-4">
              You've already submitted work for this job. Check your submissions for status updates.
            </p>
            <Button variant="outline" asChild>
              <Link to="/submissions">View My Submissions</Link>
            </Button>
          </div>
        ) : (
          <div className="glass-card p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Submit Your Work</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="submissionContent">Submission Content *</Label>
                <Textarea
                  id="submissionContent"
                  placeholder="Enter your completed work here..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submissionUrl">Submission URL (optional)</Label>
                <Input
                  id="submissionUrl"
                  type="url"
                  placeholder="https://..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Add a link to your work if applicable (Google Drive, Dropbox, etc.)
                </p>
              </div>
              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isSubmitting || !submissionContent.trim()}
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Work
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;
