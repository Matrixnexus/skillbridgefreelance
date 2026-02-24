import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Wallet,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Briefcase,
  Users,
  Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalRequest {
  id: string;
  amount: number;
  balance_type: 'referral' | 'task';
  payment_method: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  completed_at: string | null;
}

// Withdrawal limits
const REFERRAL_WITHDRAWAL_MIN = 30;
const TASK_WITHDRAWAL_MIN = 100;

const WithdrawalSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [balanceType, setBalanceType] = useState<'referral' | 'task'>('task');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  const referralBalance = profile?.referral_earnings || 0;
  const taskBalance = profile?.task_earnings || 0;
  const currentBalance = balanceType === 'referral' ? referralBalance : taskBalance;
  const minWithdrawal = balanceType === 'referral' ? REFERRAL_WITHDRAWAL_MIN : TASK_WITHDRAWAL_MIN;

  const fetchWithdrawalRequests = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawalRequests(data as WithdrawalRequest[] || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [fetchWithdrawalRequests]);

  // Check for pending withdrawal of same type
  const hasPendingWithdrawal = (type: 'referral' | 'task') => {
    return withdrawalRequests.some(
      req => req.balance_type === type && req.status === 'pending'
    );
  };

  const handleSubmitWithdrawal = async () => {
    setError(null);
    
    const amountNum = parseFloat(amount);
    
    // Validations
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amountNum < minWithdrawal) {
      setError(`Minimum withdrawal for ${balanceType} balance is $${minWithdrawal}`);
      return;
    }
    
    if (amountNum > currentBalance) {
      setError(`Insufficient balance. You have $${currentBalance.toFixed(2)} available`);
      return;
    }
    
    if (hasPendingWithdrawal(balanceType)) {
      setError(`You already have a pending ${balanceType} withdrawal request`);
      return;
    }
    
    if (!paymentDetails.trim()) {
      setError('Please provide your payment details');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error: insertError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user!.id,
          amount: amountNum,
          balance_type: balanceType,
          payment_method: paymentMethod,
          payment_details: { details: paymentDetails },
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Deduct amount from appropriate balance
      const updateData = balanceType === 'referral'
        ? { 
            referral_earnings: referralBalance - amountNum,
            approved_earnings: (profile?.approved_earnings || 0) - amountNum,
          }
        : { 
            task_earnings: taskBalance - amountNum,
            approved_earnings: (profile?.approved_earnings || 0) - amountNum,
          };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user!.id);

      if (updateError) throw updateError;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user!.id,
        title: 'Withdrawal Request Submitted',
        message: `Your withdrawal request for $${amountNum.toFixed(2)} from your ${balanceType} balance has been submitted and is pending review.`,
        type: 'withdrawal',
      });

      toast({
        title: 'Withdrawal Request Submitted',
        description: 'Your request is pending admin review',
      });

      setIsDialogOpen(false);
      setAmount('');
      setPaymentDetails('');
      refreshProfile();
      fetchWithdrawalRequests();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      setError(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
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
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referral Balance */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Referral Balance</p>
                <p className="text-2xl font-bold text-foreground">${referralBalance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Min withdrawal: ${REFERRAL_WITHDRAWAL_MIN}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={referralBalance < REFERRAL_WITHDRAWAL_MIN || hasPendingWithdrawal('referral')}
              onClick={() => {
                setBalanceType('referral');
                setIsDialogOpen(true);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
          {hasPendingWithdrawal('referral') && (
            <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
              <Clock className="w-4 h-4" />
              Pending withdrawal in progress
            </div>
          )}
        </div>

        {/* Task Balance */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Task Balance</p>
                <p className="text-2xl font-bold text-foreground">${taskBalance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Min withdrawal: ${TASK_WITHDRAWAL_MIN}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={taskBalance < TASK_WITHDRAWAL_MIN || hasPendingWithdrawal('task')}
              onClick={() => {
                setBalanceType('task');
                setIsDialogOpen(true);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
          {hasPendingWithdrawal('task') && (
            <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
              <Clock className="w-4 h-4" />
              Pending withdrawal in progress
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-blue-400/10 border border-blue-400/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Withdrawal Information</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Referral earnings have a minimum withdrawal of ${REFERRAL_WITHDRAWAL_MIN}</li>
              <li>• Task earnings have a minimum withdrawal of ${TASK_WITHDRAWAL_MIN}</li>
              <li>• All withdrawals require admin approval</li>
              <li>• Processing typically takes 1-3 business days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : withdrawalRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawalRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    request.balance_type === 'referral' ? 'bg-primary/10' : 'bg-green-400/10'
                  }`}>
                    {request.balance_type === 'referral' ? (
                      <Users className="w-5 h-5 text-primary" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      ${request.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.balance_type.charAt(0).toUpperCase() + request.balance_type.slice(1)} • {' '}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.admin_notes && request.status === 'rejected' && (
                      <p className="text-sm text-red-400 mt-1">{request.admin_notes}</p>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Withdraw from your {balanceType} balance. Minimum: ${minWithdrawal}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-foreground">${currentBalance.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  min={minWithdrawal}
                  max={currentBalance}
                  step="0.01"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAmount((currentBalance * 0.25).toFixed(2))}
                >
                  25%
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAmount((currentBalance * 0.5).toFixed(2))}
                >
                  50%
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAmount((currentBalance * 0.75).toFixed(2))}
                >
                  75%
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAmount(currentBalance.toFixed(2))}
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Details</Label>
              <Textarea
                placeholder={
                  paymentMethod === 'bank_transfer' 
                    ? 'Enter your bank account details (Bank name, Account number, Account holder name, SWIFT/BIC code if international)'
                    : paymentMethod === 'paypal'
                    ? 'Enter your PayPal email address'
                    : paymentMethod === 'crypto'
                    ? 'Enter your wallet address and network (e.g., USDT TRC20)'
                    : 'Enter your mobile money details (Phone number, Provider)'
                }
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitWithdrawal} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalSection;
