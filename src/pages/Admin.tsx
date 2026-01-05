import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Plus,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  ArrowLeft,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  instructions: string;
  payment_amount: number;
  difficulty: string;
  required_tier: string;
  estimated_time: string | null;
  is_active: boolean;
  current_submissions: number;
  category: { name: string } | null;
}

interface Submission {
  id: string;
  submission_content: string;
  status: string;
  payment_amount: number;
  created_at: string;
  job: { title: string } | null;
  user_id: string;
}

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  // Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    instructions: '',
    payment_amount: '',
    difficulty: 'easy',
    required_tier: 'regular',
    estimated_time: '',
    category_id: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [jobsResult, categoriesResult, submissionsResult] = await Promise.all([
      supabase
        .from('jobs')
        .select('*, category:job_categories(name)')
        .order('created_at', { ascending: false }),
      supabase.from('job_categories').select('*').order('name'),
      supabase
        .from('job_submissions')
        .select('*, job:jobs(title)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    if (jobsResult.data) setJobs(jobsResult.data as unknown as Job[]);
    if (categoriesResult.data) setCategories(categoriesResult.data);
    if (submissionsResult.data) setSubmissions(submissionsResult.data as unknown as Submission[]);
    setIsLoading(false);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('jobs').insert([{
      title: jobForm.title,
      description: jobForm.description,
      instructions: jobForm.instructions,
      payment_amount: parseFloat(jobForm.payment_amount),
      difficulty: jobForm.difficulty as 'easy' | 'medium' | 'hard',
      required_tier: jobForm.required_tier as 'none' | 'regular' | 'pro' | 'vip',
      estimated_time: jobForm.estimated_time || null,
      category_id: jobForm.category_id || null,
    }]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Job created successfully' });
      setIsJobDialogOpen(false);
      resetJobForm();
      fetchData();
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    
    const { error } = await supabase
      .from('jobs')
      .update({
        title: jobForm.title,
        description: jobForm.description,
        instructions: jobForm.instructions,
        payment_amount: parseFloat(jobForm.payment_amount),
        difficulty: jobForm.difficulty as 'easy' | 'medium' | 'hard',
        required_tier: jobForm.required_tier as 'none' | 'regular' | 'pro' | 'vip',
        estimated_time: jobForm.estimated_time || null,
        category_id: jobForm.category_id || null,
      })
      .eq('id', editingJob.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Job updated successfully' });
      setIsJobDialogOpen(false);
      setEditingJob(null);
      resetJobForm();
      fetchData();
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Job deleted successfully' });
      fetchData();
    }
  };

  const handleToggleJobStatus = async (job: Job) => {
    const { error } = await supabase
      .from('jobs')
      .update({ is_active: !job.is_active })
      .eq('id', job.id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchData();
    }
  };

  const handleReviewSubmission = async (submissionId: string, status: 'approved' | 'rejected', feedback?: string) => {
    const { error } = await supabase
      .from('job_submissions')
      .update({
        status,
        admin_feedback: feedback || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq('id', submissionId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Submission ${status}` });
      fetchData();
    }
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      description: '',
      instructions: '',
      payment_amount: '',
      difficulty: 'easy',
      required_tier: 'regular',
      estimated_time: '',
      category_id: '',
    });
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      instructions: job.instructions,
      payment_amount: job.payment_amount.toString(),
      difficulty: job.difficulty,
      required_tier: job.required_tier,
      estimated_time: job.estimated_time || '',
      category_id: '',
    });
    setIsJobDialogOpen(true);
  };

  const stats = [
    { name: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'text-primary' },
    { name: 'Active Jobs', value: jobs.filter(j => j.is_active).length, icon: CheckCircle, color: 'text-green-400' },
    { name: 'Pending Reviews', value: submissions.length, icon: Clock, color: 'text-yellow-400' },
    { name: 'Categories', value: categories.length, icon: FileText, color: 'text-blue-400' },
  ];

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage jobs, submissions, and users</p>
          </div>
          <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" onClick={() => { setEditingJob(null); resetJobForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                      value={jobForm.instructions}
                      onChange={(e) => setJobForm({ ...jobForm, instructions: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={jobForm.payment_amount}
                      onChange={(e) => setJobForm({ ...jobForm, payment_amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Time</Label>
                    <Input
                      value={jobForm.estimated_time}
                      onChange={(e) => setJobForm({ ...jobForm, estimated_time: e.target.value })}
                      placeholder="e.g., 30 minutes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={jobForm.difficulty} onValueChange={(v) => setJobForm({ ...jobForm, difficulty: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Required Tier</Label>
                    <Select value={jobForm.required_tier} onValueChange={(v) => setJobForm({ ...jobForm, required_tier: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Category</Label>
                    <Select value={jobForm.category_id} onValueChange={(v) => setJobForm({ ...jobForm, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" variant="hero" className="w-full">
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {['overview', 'jobs', 'submissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{job.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        job.is_active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{job.category?.name || 'General'}</span>
                      <span>${job.payment_amount}</span>
                      <span>{job.required_tier.toUpperCase()}</span>
                      <span>{job.current_submissions} submissions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleJobStatus(job)}>
                      {job.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(job)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)}>
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div key={submission.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{submission.job?.title || 'Unknown Job'}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {submission.submission_content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>${submission.payment_amount}</span>
                        <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-400 border-green-400/20 hover:bg-green-400/10"
                        onClick={() => handleReviewSubmission(submission.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                        onClick={() => handleReviewSubmission(submission.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-12 text-center">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No pending submissions</h3>
                <p className="text-muted-foreground">All submissions have been reviewed</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Jobs</h2>
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.category?.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      job.is_active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                    }`}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pending Reviews</h2>
              <div className="space-y-3">
                {submissions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{sub.job?.title}</p>
                      <p className="text-sm text-muted-foreground">${sub.payment_amount}</p>
                    </div>
                    <Clock className="w-4 h-4 text-yellow-400" />
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No pending reviews</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Admin;
