import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Lock,
  Crown,
  Send,
} from 'lucide-react';

interface WatchJob {
  id: string;
  title: string;
  description: string;
  instructions: string;
  payment_amount: number;
  difficulty: string;
  required_tier: string;
  estimated_time: string | null;
  deadline: string | null;
  max_submissions: number | null;
  current_submissions: number;
}

const WatchAndEarnTasks = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<WatchJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedJobs, setSubmittedJobs] = useState<Set<string>>(new Set());
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;

      // Fetch jobs in "Watch & Earn" category
      const { data: categoryData } = await supabase
        .from('job_categories')
        .select('id')
        .ilike('name', '%watch%')
        .maybeSingle();

      if (!categoryData) {
        setIsLoading(false);
        return;
      }

      const [jobsResult, submissionsResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, title, description, instructions, payment_amount, difficulty, required_tier, estimated_time, deadline, max_submissions, current_submissions')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('job_submissions')
          .select('job_id')
          .eq('user_id', user.id),
      ]);

      if (jobsResult.data) setJobs(jobsResult.data);
      if (submissionsResult.data) {
        setSubmittedJobs(new Set(submissionsResult.data.map(s => s.job_id)));
      }
      setIsLoading(false);
    };

    fetchJobs();
  }, [user]);

  const canAccessJob = (requiredTier: string) => {
    const tierHierarchy = ['none', 'regular', 'pro', 'vip'];
    const userTierIndex = tierHierarchy.indexOf(profile?.membership_tier || 'none');
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
    return userTierIndex >= requiredTierIndex;
  };

  const isPaidMember = profile?.membership_tier !== 'none';

  const handleSubmit = async (job: WatchJob) => {
    if (!user || !profile || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('job_submissions')
        .insert({
          job_id: job.id,
          user_id: user.id,
          submission_content: submissionNote || 'Video watched and confirmed',
          payment_amount: job.payment_amount,
          status: 'pending',
        });

      if (error) throw error;

      // Update daily tasks
      await supabase
        .from('profiles')
        .update({ daily_tasks_used: (profile.daily_tasks_used || 0) + 1 })
        .eq('id', user.id);

      await supabase
        .from('jobs')
        .update({ current_submissions: (job.current_submissions || 0) + 1 })
        .eq('id', job.id);

      toast({ title: 'Submitted!', description: 'Your watch task has been submitted for review.' });
      setSubmittedJobs(prev => new Set(prev).add(job.id));
      setActiveJob(null);
      setSubmissionNote('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract video URL from instructions (look for http links)
  const extractVideoUrl = (instructions: string) => {
    const urlMatch = instructions.match(/https?:\/\/[^\s<>"]+/);
    return urlMatch ? urlMatch[0] : null;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Watch & Earn</h1>
          <p className="text-muted-foreground mt-1">
            Watch videos and earn money. Requires an active paid subscription.
          </p>
        </div>

        {!isPaidMember && (
          <div className="glass-card p-6 border-yellow-400/20 bg-yellow-400/5">
            <div className="flex items-start gap-4">
              <Crown className="w-8 h-8 text-yellow-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Subscription Required</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You need an active Regular, Pro, or VIP subscription to access Watch & Earn tasks.
                </p>
                <Button variant="hero" size="sm" onClick={() => navigate('/pricing')}>
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Watch Tasks Available</h3>
            <p className="text-muted-foreground">Check back later for new video tasks.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map(job => {
              const accessible = canAccessJob(job.required_tier);
              const alreadySubmitted = submittedJobs.has(job.id);
              const videoUrl = extractVideoUrl(job.instructions);

              return (
                <div key={job.id} className="glass-card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          {job.estimated_time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {job.estimated_time}
                            </span>
                          )}
                        </div>
                        {!accessible && <Lock className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{job.description}</p>

                      {accessible && !alreadySubmitted && (
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-secondary/50 text-sm text-foreground">
                            <p className="font-medium mb-1">Instructions:</p>
                            <p className="whitespace-pre-wrap">{job.instructions}</p>
                          </div>

                          {videoUrl && (
                            <a
                              href={videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Open Video Link
                            </a>
                          )}

                          {activeJob === job.id ? (
                            <div className="space-y-3 mt-3">
                              <Textarea
                                placeholder="Optional: Add a note about the video you watched..."
                                value={submissionNote}
                                onChange={e => setSubmissionNote(e.target.value)}
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSubmit(job)}
                                  disabled={isSubmitting}
                                  size="sm"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => { setActiveJob(null); setSubmissionNote(''); }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => setActiveJob(job.id)}
                            >
                              I've Watched This — Submit
                            </Button>
                          )}
                        </div>
                      )}

                      {alreadySubmitted && (
                        <div className="flex items-center gap-2 text-green-400 text-sm mt-2">
                          <CheckCircle className="w-4 h-4" />
                          Already submitted
                        </div>
                      )}

                      {!accessible && (
                        <div className="flex items-center gap-2 text-yellow-400 text-sm mt-2">
                          <AlertCircle className="w-4 h-4" />
                          Requires {job.required_tier.toUpperCase()} tier or higher
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-primary">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-2xl font-bold">{job.payment_amount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">per task</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WatchAndEarnTasks;
