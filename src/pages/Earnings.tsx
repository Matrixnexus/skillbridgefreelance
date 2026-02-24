import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
}

interface PaymentSummary {
  pending: number;
  total: number;
  approved: number;
  rejected: number;
  availableForWithdrawal: number;
}

interface SubmissionSummary {
  pending: number;
  rejected: number;
}

const MIN_WITHDRAWAL = 100;
const WITHDRAWAL_INTERVAL_DAYS = 14;

const Earnings = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    pending: 0,
    total: 0,
    approved: 0,
    rejected: 0,
    availableForWithdrawal: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ───────────────────────────── AUTH ───────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  /* ────────────────────── FETCH SUBMISSIONS SUMMARY ────────────────────── */
  const fetchSubmissionsSummary = async (userId: string): Promise<SubmissionSummary> => {
    const { data: submissions } = await supabase
      .from('job_submissions')
      .select('status, payment_amount')
      .eq('user_id', userId);

    const summary: SubmissionSummary = { pending: 0, rejected: 0 };

    if (submissions) {
      submissions.forEach(sub => {
        if (sub.status === 'pending') {
          summary.pending += sub.payment_amount || 0;
        } else if (sub.status === 'rejected') {
          summary.rejected += sub.payment_amount || 0;
        }
      });
    }

    return summary;
  };

  /* ────────────────────────── FETCH TRANSACTIONS ───────────────────────── */
  const fetchTransactions = async (userId: string): Promise<Transaction[]> => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return data || [];
  };

  /* ────────────────────────── FETCH PROFILE DATA ───────────────────────── */
  const fetchProfileData = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('total_earnings, approved_earnings')
      .eq('id', userId)
      .single();
    
    return data;
  };

  /* ─────────────────────────── FETCH ALL DATA ─────────────────────────── */
  const fetchAllData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [profileData, submissionsSummary, transactionData] = await Promise.all([
        fetchProfileData(user.id),
        fetchSubmissionsSummary(user.id),
        fetchTransactions(user.id),
      ]);

      console.log('Profile Data:', profileData);
      console.log('Submissions Summary:', submissionsSummary);
      console.log('Transactions:', transactionData);

      // Calculate available for withdrawal (approved earnings only)
      const approvedEarnings = profileData?.approved_earnings || 0;
      const totalEarnings = profileData?.total_earnings || 0;

      setPaymentSummary({
        pending: submissionsSummary.pending,
        total: totalEarnings,
        approved: approvedEarnings,
        rejected: submissionsSummary.rejected,
        availableForWithdrawal: approvedEarnings
      });

      setTransactions(transactionData);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  /* ─────────────────────────── INITIAL FETCH ─────────────────────────── */
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /* ─────────────────────── REAL-TIME SUBSCRIPTIONS ─────────────────────── */
  useEffect(() => {
    if (!user) return;

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel(`earnings-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile earnings updated:', payload.new);
          fetchAllData();
        }
      )
      .subscribe();

    // Subscribe to submissions changes
    const submissionsChannel = supabase
      .channel(`earnings-submissions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_submissions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Submissions changed, refreshing earnings');
          fetchAllData();
        }
      )
      .subscribe();

    // Subscribe to transactions changes
    const transactionsChannel = supabase
      .channel(`earnings-transactions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Transactions changed, refreshing list');
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [user, fetchAllData]);

  /* ────────────────────────── REFRESH DATA ───────────────────────── */
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllData();
  };

  /* ─────────────────────── WITHDRAWAL HELPERS ─────────────────────── */
  const getLastWithdrawalDate = useCallback(() => {
    const lastWithdrawal = transactions.find(t => 
      t.type === 'payout' && t.status === 'completed'
    );
    return lastWithdrawal ? new Date(lastWithdrawal.created_at) : null;
  }, [transactions]);

  const canWithdrawByDate = useCallback(() => {
    const lastDate = getLastWithdrawalDate();
    if (!lastDate) return true;

    const diff = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= WITHDRAWAL_INTERVAL_DAYS;
  }, [getLastWithdrawalDate]);

  const getNextWithdrawalDate = useCallback(() => {
    const lastDate = getLastWithdrawalDate();
    if (!lastDate) return null;

    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + WITHDRAWAL_INTERVAL_DAYS);
    return nextDate;
  }, [getLastWithdrawalDate]);

  /* ─────────────────────── WITHDRAWAL ACTION ─────────────────────── */
  const handleWithdrawRequest = async () => {
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amount = Number(withdrawAmount);

    // Validation
    if (!amount || amount <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }

    if (amount < MIN_WITHDRAWAL) {
      setWithdrawError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL.toFixed(2)} USD.`);
      return;
    }

    if (!canWithdrawByDate()) {
      const nextDate = getNextWithdrawalDate();
      setWithdrawError(
        `You can withdraw again on ${nextDate?.toLocaleDateString()}. Withdrawals are allowed every ${WITHDRAWAL_INTERVAL_DAYS} days.`
      );
      return;
    }

    if (amount > paymentSummary.availableForWithdrawal) {
      setWithdrawError(`Insufficient funds. You have $${paymentSummary.availableForWithdrawal.toFixed(2)} available for withdrawal.`);
      return;
    }

    try {
      setIsSubmitting(true);

      // Insert withdrawal request directly into Supabase
      const { error: insertError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user!.id,
          amount,
          balance_type: 'task',
          payment_method: 'bank_transfer',
          payment_details: { note: 'Requested from earnings page' },
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Deduct from task_earnings and approved_earnings
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          task_earnings: Math.max(0, (profile?.task_earnings || 0) - amount),
          approved_earnings: Math.max(0, (profile?.approved_earnings || 0) - amount),
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      setWithdrawSuccess(
        'Withdrawal request submitted successfully! Your request is under review.'
      );
      setWithdrawAmount('');
      
      // Refresh data
      setTimeout(() => fetchAllData(), 1000);
      
    } catch (error: any) {
      setWithdrawError(
        error.message || 'Unable to process withdrawal request. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ────────────────────────── UI HELPERS ────────────────────────── */
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'payout':
        return <Download className="w-5 h-5 text-primary" />;
      case 'subscription':
        return <Calendar className="w-5 h-5 text-yellow-400" />;
      default:
        return <DollarSign className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'bg-green-400/10 text-green-400';
      case 'pending':
        return 'bg-yellow-400/10 text-yellow-400';
      case 'failed':
      case 'rejected':
        return 'bg-red-400/10 text-red-400';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Earnings Dashboard</h1>
            <p className="text-muted-foreground">
              Track your income, manage withdrawals, and view transaction history
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* EARNINGS STATS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Earnings"
            value={formatCurrency(paymentSummary.total)}
            description="All-time earnings from approved tasks"
            trend="up"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending Review"
            value={formatCurrency(paymentSummary.pending)}
            description="Awaiting admin approval"
            trend="neutral"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Approved Balance"
            value={formatCurrency(paymentSummary.approved)}
            description="Ready for withdrawal"
            trend="up"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Rejected Earnings"
            value={formatCurrency(paymentSummary.rejected)}
            description="Not eligible for payment"
            trend="down"
          />
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-green-400/10 rounded-xl text-green-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available to Withdraw</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(paymentSummary.availableForWithdrawal)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Immediate withdrawal eligible
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* WITHDRAWAL SECTION */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Column - Withdrawal Form */}
            <div className="lg:w-1/2 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Request Withdrawal</h2>
                <p className="text-sm text-muted-foreground">
                  Transfer your approved earnings to your account
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Withdrawal Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min="0"
                      max={paymentSummary.availableForWithdrawal}
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Available: {formatCurrency(paymentSummary.availableForWithdrawal)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setWithdrawAmount((paymentSummary.availableForWithdrawal * 0.25).toFixed(2))}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => setWithdrawAmount((paymentSummary.availableForWithdrawal * 0.5).toFixed(2))}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => setWithdrawAmount((paymentSummary.availableForWithdrawal * 0.75).toFixed(2))}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    75%
                  </button>
                  <button
                    onClick={() => setWithdrawAmount(paymentSummary.availableForWithdrawal.toFixed(2))}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    100%
                  </button>
                </div>

                {withdrawError && (
                  <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-sm text-red-400">{withdrawError}</p>
                    </div>
                  </div>
                )}

                {withdrawSuccess && (
                  <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-green-400">{withdrawSuccess}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleWithdrawRequest}
                  disabled={isSubmitting || paymentSummary.availableForWithdrawal < MIN_WITHDRAWAL}
                  className="w-full px-6 py-3 bg-primary rounded-lg text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Request Withdrawal'
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Requirements & Info */}
            <div className="lg:w-1/2 space-y-6">
              <div>
                <h3 className="font-medium mb-4">Withdrawal Requirements</h3>
                <ul className="space-y-3">
                  <RequirementItem
                    met={paymentSummary.availableForWithdrawal >= MIN_WITHDRAWAL}
                    label={`Minimum withdrawal: ${formatCurrency(MIN_WITHDRAWAL)}`}
                    description={`Current: ${formatCurrency(paymentSummary.availableForWithdrawal)}`}
                  />
                  <RequirementItem
                    met={canWithdrawByDate()}
                    label={`Withdrawal interval: Every ${WITHDRAWAL_INTERVAL_DAYS} days`}
                    description={getLastWithdrawalDate() 
                      ? `Last: ${getLastWithdrawalDate()?.toLocaleDateString()}`
                      : 'No previous withdrawals'
                    }
                  />
                  <RequirementItem
                    met={paymentSummary.availableForWithdrawal > 0}
                    label="Available approved balance"
                    description="Only approved earnings can be withdrawn"
                  />
                </ul>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium mb-2">Withdrawal Timeline</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Request submitted</span>
                    <span className="text-green-400">Immediate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin review</span>
                    <span>1-3 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment processing</span>
                    <span>3-5 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Funds received</span>
                    <span>4-8 business days total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EARNINGS BREAKDOWN & TRANSACTIONS */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Earnings Breakdown */}
          <div className="lg:col-span-1 glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Earnings Breakdown</h2>
            <div className="space-y-4">
              <BreakdownItem
                label="Approved"
                amount={paymentSummary.approved}
                percentage={paymentSummary.total > 0 ? (paymentSummary.approved / paymentSummary.total) * 100 : 0}
                color="bg-green-400"
                description="Ready for withdrawal"
              />
              <BreakdownItem
                label="Pending"
                amount={paymentSummary.pending}
                percentage={paymentSummary.total > 0 ? (paymentSummary.pending / paymentSummary.total) * 100 : 0}
                color="bg-yellow-400"
                description="Under review"
              />
              <BreakdownItem
                label="Rejected"
                amount={paymentSummary.rejected}
                percentage={paymentSummary.total > 0 ? (paymentSummary.rejected / paymentSummary.total) * 100 : 0}
                color="bg-red-400"
                description="Not payable"
              />
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">{formatCurrency(paymentSummary.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Transaction History</h2>
              <span className="text-sm text-muted-foreground">
                {transactions.length} transactions
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete tasks to see earnings here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background group-hover:bg-background/80">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">{tx.type}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tx.description || 'No description available'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.type === 'earning' ? 'text-green-400' : 'text-foreground'}`}>
                        {tx.type === 'earning' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* INFO PANEL */}
        <div className="glass-card p-6 bg-blue-400/5 border border-blue-400/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-400 mb-1">How Earnings Work</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Pending earnings</strong> are from completed tasks awaiting admin review</li>
                <li>• <strong>Approved earnings</strong> become available for withdrawal after review</li>
                <li>• <strong>Rejected earnings</strong> are from tasks that didn't meet requirements</li>
                <li>• Withdrawals are processed within 4-8 business days after approval</li>
                <li>• Contact support if you have questions about your earnings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* ───────────────────────── COMPONENTS ───────────────────────── */
const StatCard = ({
  icon,
  label,
  value,
  description,
  trend,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}) => {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-yellow-400';
  
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${
          trend === 'up' ? 'bg-green-400/10 text-green-400' :
          trend === 'down' ? 'bg-red-400/10 text-red-400' :
          'bg-primary/10 text-primary'
        }`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <div className="flex items-center gap-1 mt-1">
              {trend && trend !== 'neutral' && (
                <span className={`text-xs ${trendColor}`}>
                  {trend === 'up' ? '↑' : '↓'}
                </span>
              )}
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RequirementItem = ({
  met,
  label,
  description,
}: {
  met: boolean;
  label: string;
  description?: string;
}) => (
  <li className="flex items-start gap-2">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
      met ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'
    }`}>
      {met ? '✓' : '!'}
    </div>
    <div>
      <span className="text-sm">{label}</span>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  </li>
);

const BreakdownItem = ({
  label,
  amount,
  percentage,
  color,
  description,
}: {
  label: string;
  amount: number;
  percentage: number;
  color: string;
  description?: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <div>
        <span className="text-foreground">{label}</span>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="text-right">
        <span className="font-medium">${amount.toFixed(2)}</span>
        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
      </div>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

export default Earnings;