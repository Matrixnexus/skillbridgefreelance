import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/utils/cloudinary';
import {
  Heart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Lock,
  Crown,
  Send,
  Upload,
  X,
  Image,
} from 'lucide-react';

interface FollowJob {
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

const FollowAndEarn = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jobs, setJobs] = useState<FollowJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedJobs, setSubmittedJobs] = useState<Set<string>>(new Set());
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;

      // Fetch jobs in "Follow & Earn" category
      const { data: categoryData } = await supabase
        .from('job_categories')
        .select('id')
        .ilike('name', '%follow%')
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).filter(f => {
      if (f.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: `${f.name} exceeds 10MB limit`, variant: 'destructive' });
        return false;
      }
      if (!f.type.startsWith('image/')) {
        toast({ title: 'Invalid file', description: 'Only image files are allowed for screenshots', variant: 'destructive' });
        return false;
      }
      return true;
    });

    setScreenshots(prev => [...prev, ...newFiles].slice(0, 5)); // max 5
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (job: FollowJob) => {
    if (!user || !profile || isSubmitting) return;

    if (screenshots.length === 0) {
      toast({ title: 'Screenshots Required', description: 'Please upload at least one screenshot as proof.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload screenshots
      const uploadedUrls: string[] = [];
      for (const file of screenshots) {
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }

      const { error } = await supabase
        .from('job_submissions')
        .insert({
          job_id: job.id,
          user_id: user.id,
          submission_content: submissionNote || 'Follow & Earn task completed with screenshot proof',
          submission_url: uploadedUrls[0],
          file_url: uploadedUrls[0],
          worker_file_url: uploadedUrls[0],
          file_name: screenshots[0].name,
          worker_file_name: screenshots[0].name,
          file_type: screenshots[0].type,
          file_size: screenshots[0].size,
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

      toast({ title: 'Submitted!', description: 'Your follow task has been submitted for review.' });
      setSubmittedJobs(prev => new Set(prev).add(job.id));
      setActiveJob(null);
      setSubmissionNote('');
      setScreenshots([]);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Follow & Earn</h1>
          <p className="text-muted-foreground mt-1">
            Follow social accounts, like posts, comment positively, and submit proof screenshots.
          </p>
        </div>

        {!isPaidMember && (
          <div className="glass-card p-6 border-yellow-400/20 bg-yellow-400/5">
            <div className="flex items-start gap-4">
              <Crown className="w-8 h-8 text-yellow-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Subscription Required</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You need an active Regular, Pro, or VIP subscription to access Follow & Earn tasks.
                </p>
                <Button variant="hero" size="sm" onClick={() => navigate('/pricing')}>
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">How it works</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Read the task instructions carefully</li>
                <li>• Follow the social account, like/comment as instructed</li>
                <li>• Take screenshots as proof of completion</li>
                <li>• Upload screenshots and submit for admin review</li>
              </ul>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Follow Tasks Available</h3>
            <p className="text-muted-foreground">Check back later for new social media tasks.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map(job => {
              const accessible = canAccessJob(job.required_tier);
              const alreadySubmitted = submittedJobs.has(job.id);

              return (
                <div key={job.id} className="glass-card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-pink-400/10 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-pink-400" />
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

                          {activeJob === job.id ? (
                            <div className="space-y-3 mt-3">
                              <Textarea
                                placeholder="Optional: Add a note about what you did..."
                                value={submissionNote}
                                onChange={e => setSubmissionNote(e.target.value)}
                                rows={2}
                              />

                              {/* Screenshot upload */}
                              <div>
                                <p className="text-sm font-medium text-foreground mb-2">
                                  Upload Screenshots (required, max 5)
                                </p>
                                <div className="flex flex-wrap gap-3">
                                  {screenshots.map((file, idx) => (
                                    <div key={idx} className="relative w-20 h-20 rounded-lg border border-border overflow-hidden">
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Screenshot ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        onClick={() => removeScreenshot(idx)}
                                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {screenshots.length < 5 && (
                                    <button
                                      onClick={() => fileInputRef.current?.click()}
                                      className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                    >
                                      <Upload className="w-5 h-5" />
                                      <span className="text-[10px] mt-1">Add</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSubmit(job)}
                                  disabled={isSubmitting || screenshots.length === 0}
                                  size="sm"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {isSubmitting ? 'Uploading & Submitting...' : 'Submit with Screenshots'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => { setActiveJob(null); setSubmissionNote(''); setScreenshots([]); }}
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
                              I've Completed This — Submit Proof
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

export default FollowAndEarn;
