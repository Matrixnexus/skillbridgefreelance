import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Upload,
  X,
  FileIcon,
  User,
  Mail,
  Download,
  ExternalLink,
  Filter,
  Database,
} from 'lucide-react';
import { uploadToCloudinary, formatFileSize } from '@/utils/cloudinary';

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
  job_file_url: string | null;
  job_file_name: string | null;
  job_file_type: string | null;
}

interface Submission {
  id: string;
  submission_content: string;
  file_url: string | null;
  worker_file_url: string | null;
  file_name: string | null;
  worker_file_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback: string | null;
  payment_amount: number;
  created_at: string;
  reviewed_at: string | null;
  job_title: string | null;
  user_id: string;
  user_email: string;
  user_name: string | null;
}

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [dataSource, setDataSource] = useState<'view' | 'table'>('view');
  
  // For submission review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  
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

  // File upload state
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch data
  useEffect(() => {
    if (user && isAdmin && !authLoading) {
      fetchData();
    }
  }, [user, isAdmin, authLoading, dataSource]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch jobs and categories
      const [jobsResult, categoriesResult] = await Promise.all([
        supabase
          .from('jobs')
          .select('*, category:job_categories(name)')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('job_categories').select('*').order('name'),
      ]);

      if (jobsResult.data) setJobs(jobsResult.data as unknown as Job[]);
      if (categoriesResult.data) setCategories(categoriesResult.data);

      // Fetch submissions based on data source
      let submissionsResult;
      if (dataSource === 'view') {
        submissionsResult = await supabase
          .from('admin_submissions_view')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
      } else {
        submissionsResult = await supabase
          .from('job_submissions')
          .select(`
            *,
            job:jobs(title),
            profile:profiles(email, full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);
      }

      if (submissionsResult.data) {
        let formattedSubmissions: Submission[];
        if (dataSource === 'view') {
          formattedSubmissions = submissionsResult.data.map((sub: any) => ({
            id: sub.id,
            submission_content: sub.submission_content,
            file_url: sub.file_url,
            worker_file_url: sub.worker_file_url,
            file_name: sub.file_name,
            worker_file_name: sub.worker_file_name,
            status: sub.status,
            admin_feedback: sub.admin_feedback,
            payment_amount: sub.payment_amount,
            created_at: sub.created_at,
            reviewed_at: sub.reviewed_at,
            job_title: sub.job_title,
            user_id: sub.user_id,
            user_email: sub.user_email,
            user_name: sub.user_name,
          }));
        } else {
          formattedSubmissions = submissionsResult.data.map((sub: any) => ({
            id: sub.id,
            submission_content: sub.submission_content,
            file_url: sub.file_url,
            worker_file_url: sub.worker_file_url,
            file_name: sub.file_name,
            worker_file_name: sub.worker_file_name,
            status: sub.status,
            admin_feedback: sub.admin_feedback,
            payment_amount: sub.payment_amount,
            created_at: sub.created_at,
            reviewed_at: sub.reviewed_at,
            job_title: sub.job?.title,
            user_id: sub.user_id,
            user_email: sub.profile?.email,
            user_name: sub.profile?.full_name,
          }));
        }
        
        setAllSubmissions(formattedSubmissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get file URL for display
  const getFileUrl = (submission: Submission): string | null => {
    return submission.file_url || submission.worker_file_url;
  };

  // Get file name for display
  const getFileName = (submission: Submission): string | null => {
    return submission.file_name || submission.worker_file_name || 'Submitted File';
  };

  // Handle submission review with earnings update
  const handleReviewSubmission = async (status: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;

    setIsReviewing(true);
    
    try {
      // Update submission status
      const updateData: any = {
        status,
        admin_feedback: feedback || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      };

      const { error: submissionError } = await supabase
        .from('job_submissions')
        .update(updateData)
        .eq('id', selectedSubmission.id);

      if (submissionError) throw submissionError;

      // If approved, update user earnings
      if (status === 'approved') {
        // First get current user earnings
        const { data: profile } = await supabase
          .from('profiles')
          .select('approved_earnings, total_earnings, tasks_completed')
          .eq('id', selectedSubmission.user_id)
          .single();

        if (profile) {
          const currentApprovedEarnings = profile.approved_earnings || 0;
          const currentTotalEarnings = profile.total_earnings || 0;
          const currentTasksCompleted = profile.tasks_completed || 0;

          // Update user's profile earnings
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              approved_earnings: currentApprovedEarnings + selectedSubmission.payment_amount,
              total_earnings: currentTotalEarnings + selectedSubmission.payment_amount,
              tasks_completed: currentTasksCompleted + 1,
            })
            .eq('id', selectedSubmission.user_id);

          if (profileError) {
            console.warn('Failed to update user earnings:', profileError);
          }
        }
      }

      toast({ 
        title: 'Success', 
        description: `Submission ${status}` 
      });

      // Refresh data
      await fetchData();
      
      // Close dialog
      setReviewDialogOpen(false);
      setSelectedSubmission(null);
      setFeedback('');
      
    } catch (error: any) {
      console.error('Review error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to review submission', 
        variant: 'destructive' 
      });
    } finally {
      setIsReviewing(false);
    }
  };

  // Open review dialog
  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.admin_feedback || '');
    setReviewDialogOpen(true);
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 100MB',
        variant: 'destructive',
      });
      return;
    }

    setJobFile(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setJobFile(null);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUploading(true);

    try {
      let cloudinaryUrl = null;
      let jobFileName = null;
      let jobFileType = null;

      if (jobFile) {
        try {
          cloudinaryUrl = await uploadToCloudinary(jobFile);
          jobFileName = jobFile.name;
          jobFileType = jobFile.type;
        } catch (uploadError) {
          console.warn('Cloudinary upload failed:', uploadError);
        }
      }

      const { data: jobData, error } = await supabase
        .from('jobs')
        .insert([{
          title: jobForm.title,
          description: jobForm.description,
          instructions: jobForm.instructions,
          payment_amount: parseFloat(jobForm.payment_amount),
          difficulty: jobForm.difficulty as 'easy' | 'medium' | 'hard',
          required_tier: jobForm.required_tier as 'none' | 'regular' | 'pro' | 'vip',
          estimated_time: jobForm.estimated_time || null,
          category_id: jobForm.category_id || null,
          job_file_url: cloudinaryUrl,
          job_file_name: jobFileName,
          job_file_type: jobFileType,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Job created successfully',
        description: jobFile ? 'Job created with file' : 'Job created without file',
      });

      setIsJobDialogOpen(false);
      resetJobForm();
      await fetchData();

    } catch (error: any) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error creating job',
        description: error.message || 'Failed to create job',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    setIsUploading(true);

    try {
      const updateData: any = {
        title: jobForm.title,
        description: jobForm.description,
        instructions: jobForm.instructions,
        payment_amount: parseFloat(jobForm.payment_amount),
        difficulty: jobForm.difficulty as 'easy' | 'medium' | 'hard',
        required_tier: jobForm.required_tier as 'none' | 'regular' | 'pro' | 'vip',
        estimated_time: jobForm.estimated_time || null,
        category_id: jobForm.category_id || null,
      };

      if (jobFile) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(jobFile);
          updateData.job_file_url = cloudinaryUrl;
          updateData.job_file_name = jobFile.name;
          updateData.job_file_type = jobFile.type;
        } catch (uploadError) {
          console.warn('Cloudinary upload failed:', uploadError);
        }
      } else if (!jobFile && editingJob.job_file_url) {
        updateData.job_file_url = editingJob.job_file_url;
        updateData.job_file_name = editingJob.job_file_name;
        updateData.job_file_type = editingJob.job_file_type;
      }

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', editingJob.id);

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: 'Job updated successfully' 
      });
      
      setIsJobDialogOpen(false);
      setEditingJob(null);
      resetJobForm();
      await fetchData();

    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update job', 
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Job deleted successfully' });
      await fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  };

  const handleToggleJobStatus = async (job: Job) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);
      
      if (error) throw error;
      
      await fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
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
    setJobFile(null);
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
      category_id: job.category_id || '',
    });
    setJobFile(null);
    setIsJobDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
      case 'approved':
        return 'bg-green-400/10 text-green-400 border-green-400/20';
      case 'rejected':
        return 'bg-red-400/10 text-red-400 border-red-400/20';
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    }
  };

  const filteredSubmissions = allSubmissions.filter(submission => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
      submission.job_title?.toLowerCase().includes(searchLower) ||
      submission.user_email?.toLowerCase().includes(searchLower) ||
      submission.user_name?.toLowerCase().includes(searchLower) ||
      submission.submission_content?.toLowerCase().includes(searchLower)
    );
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingSubmissions = allSubmissions.filter(sub => sub.status === 'pending');

  const stats = [
    { 
      name: 'Total Jobs', 
      value: jobs.length, 
      icon: Briefcase, 
      color: 'text-primary' 
    },
    { 
      name: 'Active Jobs', 
      value: jobs.filter(j => j.is_active).length, 
      icon: CheckCircle, 
      color: 'text-green-400' 
    },
    { 
      name: 'Pending Reviews', 
      value: pendingSubmissions.length, 
      icon: Clock, 
      color: 'text-yellow-400' 
    },
    { 
      name: 'Total Submissions', 
      value: allSubmissions.length, 
      icon: FileText, 
      color: 'text-blue-400' 
    },
  ];

  // Loading skeleton
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Database className="w-4 h-4" />
              <span className="text-muted-foreground">Data Source:</span>
              <Select value={dataSource} onValueChange={(value: 'view' | 'table') => setDataSource(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="hero" 
                  onClick={() => { 
                    setEditingJob(null); 
                    resetJobForm(); 
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingJob ? 'Edit Job' : 'Create New Job'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        required
                        disabled={isUploading}
                        placeholder="Enter job title"
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                        rows={3}
                        required
                        disabled={isUploading}
                        placeholder="Describe the job requirements"
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label>Instructions *</Label>
                      <Textarea
                        value={jobForm.instructions}
                        onChange={(e) => setJobForm({ ...jobForm, instructions: e.target.value })}
                        rows={4}
                        required
                        disabled={isUploading}
                        placeholder="Provide detailed instructions"
                      />
                    </div>
                    
                    {/* File Upload Section */}
                    <div className="col-span-2 space-y-4">
                      <div className="space-y-2">
                        <Label>Job File (Optional)</Label>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar,.mp4,.mp3,.xls,.xlsx,.ppt,.pptx"
                          disabled={isUploading}
                        />
                        
                        <div className="space-y-3">
                          {!jobFile ? (
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                              <h3 className="font-medium text-foreground mb-2">
                                Select job file (Optional)
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Select the job file to upload - optional
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleFileUploadClick}
                                disabled={isUploading}
                                className="mx-auto"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Select File
                              </Button>
                              <p className="text-xs text-muted-foreground mt-3">
                                Maximum file size: 100MB
                              </p>
                            </div>
                          ) : (
                            <div className="border border-border rounded-lg p-4 bg-secondary/20">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                                    <FileIcon className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {jobFile.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatFileSize(jobFile.size)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={removeFile}
                                  disabled={isUploading}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Payment Amount ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={jobForm.payment_amount}
                        onChange={(e) => setJobForm({ ...jobForm, payment_amount: e.target.value })}
                        required
                        disabled={isUploading}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Estimated Time</Label>
                      <Input
                        value={jobForm.estimated_time}
                        onChange={(e) => setJobForm({ ...jobForm, estimated_time: e.target.value })}
                        placeholder="e.g., 30 minutes"
                        disabled={isUploading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Difficulty *</Label>
                      <Select 
                        value={jobForm.difficulty} 
                        onValueChange={(v) => setJobForm({ ...jobForm, difficulty: v })}
                        disabled={isUploading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Required Tier *</Label>
                      <Select 
                        value={jobForm.required_tier} 
                        onValueChange={(v) => setJobForm({ ...jobForm, required_tier: v })}
                        disabled={isUploading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={jobForm.category_id} 
                        onValueChange={(v) => setJobForm({ ...jobForm, category_id: v })}
                        disabled={isUploading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="w-full"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      editingJob ? 'Update Job' : 'Create Job'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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

        {/* Review Submission Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Feedback (Optional)</Label>
                  <Textarea
                    placeholder="Provide feedback for the worker..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    disabled={isReviewing}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setReviewDialogOpen(false)}
                    disabled={isReviewing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReviewSubmission('rejected')}
                    disabled={isReviewing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant="hero"
                    onClick={() => handleReviewSubmission('approved')}
                    disabled={isReviewing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Pay ${selectedSubmission.payment_amount}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Content */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {isLoading && jobs.length === 0 ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-card p-4">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {jobs.map((job) => (
                  <div key={job.id} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            job.is_active 
                              ? 'bg-green-400/10 text-green-400' 
                              : 'bg-red-400/10 text-red-400'
                          }`}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {job.job_file_url && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 flex items-center gap-1">
                              <FileIcon className="w-3 h-3" />
                              Has File
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{job.category?.name || 'General'}</span>
                          <span>${job.payment_amount}</span>
                          <span>{job.required_tier.toUpperCase()}</span>
                          <span>{job.current_submissions} submissions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleJobStatus(job)}
                          title={job.is_active ? 'Deactivate job' : 'Activate job'}
                        >
                          {job.is_active ? 
                            <XCircle className="w-4 h-4" /> : 
                            <CheckCircle className="w-4 h-4" />
                          }
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditDialog(job)}
                          title="Edit job"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteJob(job.id)}
                          title="Delete job"
                        >
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="glass-card p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search submissions by job title, worker name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-3 h-3" />
                  All ({allSubmissions.length})
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                  className="flex items-center gap-2"
                >
                  <Clock className="w-3 h-3" />
                  Pending ({pendingSubmissions.length})
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('approved')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approved ({allSubmissions.filter(s => s.status === 'approved').length})
                </Button>
                <Button
                  variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('rejected')}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-3 h-3" />
                  Rejected ({allSubmissions.filter(s => s.status === 'rejected').length})
                </Button>
              </div>
            </div>

            {isLoading && allSubmissions.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="glass-card p-6">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : filteredSubmissions.length > 0 ? (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => {
                  const fileUrl = getFileUrl(submission);
                  const fileName = getFileName(submission);
                  
                  return (
                    <div key={submission.id} className="glass-card p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 pb-4 border-b border-border">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {submission.job_title || 'Unknown Job'}
                            </h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(submission.status)}`}>
                              {submission.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {submission.id.substring(0, 8)}...
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium text-foreground">
                                {submission.user_name || 'No name provided'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span className="font-medium text-foreground">
                                {submission.user_email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-medium text-foreground">
                                ${submission.payment_amount}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium text-foreground">
                                {new Date(submission.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {submission.status === 'pending' ? (
                          <Button
                            variant="outline"
                            onClick={() => openReviewDialog(submission)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        ) : (
                          <div className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(submission.status)}`}>
                            {submission.status.toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {fileUrl && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                              <FileIcon className="w-4 h-4" />
                              Submitted File
                            </h4>
                            <div className="p-4 bg-secondary/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-foreground">
                                    {fileName}
                                  </p>
                                  <a 
                                    href={fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View File
                                  </a>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(fileUrl, '_blank')}
                                  className="flex items-center gap-1"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-foreground">Submission Notes</h4>
                          <div className="p-4 bg-secondary/30 rounded-lg whitespace-pre-wrap text-sm">
                            {submission.submission_content || 'No additional notes provided.'}
                          </div>
                        </div>
                        
                        {submission.admin_feedback && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-foreground">Admin Feedback</h4>
                            <div className="p-4 bg-blue-400/10 rounded-lg whitespace-pre-wrap text-sm border border-blue-400/20">
                              {submission.admin_feedback}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? 'No matching submissions' : 'No submissions found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search query or filters' 
                    : 'There are no submissions matching the current filter'}
                </p>
                <div className="flex flex-col gap-2 items-center">
                  <p className="text-sm text-muted-foreground">
                    Data Source: <span className="font-medium">{dataSource}</span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDataSource(dataSource === 'view' ? 'table' : 'view')}
                    className="flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Switch to {dataSource === 'view' ? 'Table' : 'View'}
                  </Button>
                </div>
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
                {jobs.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No jobs yet</p>
                )}
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Submissions</h2>
              <div className="space-y-3">
                {allSubmissions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{sub.job_title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate">
                          {sub.user_name || sub.user_email}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400">
                        ${sub.payment_amount}
                      </span>
                    </div>
                  </div>
                ))}
                {allSubmissions.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No submissions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Data Source: <span className="font-medium">{dataSource}</span>
                    </p>
                  </div>
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