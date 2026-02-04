import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  Briefcase,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  balance_type: 'referral' | 'task';
  payment_method: string;
  payment_details: { details?: string } | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  completed_at: string | null;
  user?: {
    full_name: string | null;
    email: string;
  };
}

const AdminWithdrawalManagement = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          user:profiles!withdrawal_requests_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setWithdrawals(data as WithdrawalRequest[] || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load withdrawal requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleReview = async (status: 'approved' | 'rejected' | 'completed') => {
    if (!selectedWithdrawal) return;
    
    setIsProcessing(true);
    try {
      const updateData: Partial<WithdrawalRequest> = {
        status,
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      // If rejecting, return the funds to the user
      if (status === 'rejected') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('referral_earnings, task_earnings, approved_earnings')
          .eq('id', selectedWithdrawal.user_id)
          .single();

        if (profile) {
          const updateProfile = selectedWithdrawal.balance_type === 'referral'
            ? { 
                referral_earnings: (profile.referral_earnings || 0) + selectedWithdrawal.amount,
                approved_earnings: (profile.approved_earnings || 0) + selectedWithdrawal.amount,
              }
            : { 
                task_earnings: (profile.task_earnings || 0) + selectedWithdrawal.amount,
                approved_earnings: (profile.approved_earnings || 0) + selectedWithdrawal.amount,
              };

          await supabase
            .from('profiles')
            .update(updateProfile)
            .eq('id', selectedWithdrawal.user_id);
        }

        // Notify user
        await supabase.from('notifications').insert({
          user_id: selectedWithdrawal.user_id,
          title: 'Withdrawal Request Rejected',
          message: `Your withdrawal request for $${selectedWithdrawal.amount.toFixed(2)} has been rejected. ${adminNotes ? `Reason: ${adminNotes}` : ''}`,
          type: 'withdrawal',
        });
      }

      if (status === 'approved') {
        // Notify user
        await supabase.from('notifications').insert({
          user_id: selectedWithdrawal.user_id,
          title: 'Withdrawal Request Approved',
          message: `Your withdrawal request for $${selectedWithdrawal.amount.toFixed(2)} has been approved and is being processed.`,
          type: 'withdrawal',
        });
      }

      if (status === 'completed') {
        // Notify user
        await supabase.from('notifications').insert({
          user_id: selectedWithdrawal.user_id,
          title: 'Withdrawal Completed',
          message: `Your withdrawal of $${selectedWithdrawal.amount.toFixed(2)} has been completed and sent to your payment method.`,
          type: 'withdrawal',
        });
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .eq('id', selectedWithdrawal.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Withdrawal request ${status}`,
      });

      setReviewDialogOpen(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
      fetchWithdrawals();
    } catch (error: any) {
      console.error('Review error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process withdrawal',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openReviewDialog = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setAdminNotes(withdrawal.admin_notes || '');
    setReviewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-400/10 text-green-400';
      case 'approved':
        return 'bg-blue-400/10 text-blue-400';
      case 'pending':
        return 'bg-yellow-400/10 text-yellow-400';
      case 'rejected':
        return 'bg-red-400/10 text-red-400';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'approved':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      w.user?.full_name?.toLowerCase().includes(query) ||
      w.user?.email?.toLowerCase().includes(query) ||
      w.id.toLowerCase().includes(query)
    );
  });

  const stats = {
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
    totalPending: withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <p className="text-xl font-bold">${stats.totalPending.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold">{stats.completed}</p>
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
              <p className="text-xl font-bold">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchWithdrawals}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Withdrawals List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No withdrawal requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-secondary/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{withdrawal.user?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{withdrawal.user?.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                        withdrawal.balance_type === 'referral' ? 'bg-primary/10 text-primary' : 'bg-green-400/10 text-green-400'
                      }`}>
                        {withdrawal.balance_type === 'referral' ? <Users className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                        {withdrawal.balance_type.charAt(0).toUpperCase() + withdrawal.balance_type.slice(1)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-foreground">${withdrawal.amount.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground capitalize">
                        {withdrawal.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(withdrawal.status)}`}>
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewDialog(withdrawal)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review and process this withdrawal request
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              {/* User Info */}
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">User</p>
                    <p className="font-medium">{selectedWithdrawal.user?.full_name || 'Unknown'}</p>
                    <p className="text-muted-foreground">{selectedWithdrawal.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold text-foreground">${selectedWithdrawal.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Balance Type */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Balance Type:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  selectedWithdrawal.balance_type === 'referral' ? 'bg-primary/10 text-primary' : 'bg-green-400/10 text-green-400'
                }`}>
                  {selectedWithdrawal.balance_type === 'referral' ? <Users className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                  {selectedWithdrawal.balance_type.charAt(0).toUpperCase() + selectedWithdrawal.balance_type.slice(1)}
                </span>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <p className="text-sm p-3 rounded-lg bg-secondary capitalize">
                  {selectedWithdrawal.payment_method.replace('_', ' ')}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Payment Details</Label>
                <p className="text-sm p-3 rounded-lg bg-secondary whitespace-pre-wrap">
                  {selectedWithdrawal.payment_details?.details || 'No details provided'}
                </p>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  placeholder="Add notes (visible to user if rejected)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Current Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current Status:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedWithdrawal.status)}`}>
                  {getStatusIcon(selectedWithdrawal.status)}
                  {selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedWithdrawal?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleReview('rejected')}
                  disabled={isProcessing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview('approved')}
                  disabled={isProcessing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            {selectedWithdrawal?.status === 'approved' && (
              <Button
                onClick={() => handleReview('completed')}
                disabled={isProcessing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Completed
              </Button>
            )}
            <Button variant="ghost" onClick={() => setReviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawalManagement;
