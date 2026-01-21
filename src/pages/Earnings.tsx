import { useEffect, useState } from 'react';
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
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'earning' | 'payout' | 'subscription';
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
}

const MIN_WITHDRAWAL = 1000;
const WITHDRAWAL_INTERVAL_DAYS = 14;

const Earnings = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    pending: 0,
    total: 0,
    approved: 0,
    rejected: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ───────────────────────────── AUTH ───────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  /* ───────────────────────── FETCH DATA ───────────────────────── */
  useEffect(() => {
// In Earnings.tsx, modify the fetchData function:
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // FORCE fresh data - add timestamp to bypass cache
        const timestamp = new Date().getTime();
        
        // 1. Get fresh profile data directly
        const { data: freshProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('FRESH PROFILE DATA:', freshProfile); // DEBUG
        
        if (freshProfile) {
          setPaymentSummary({
            pending: 0, // We'll calculate these next
            total: freshProfile.total_earnings || 0,
            approved: freshProfile.approved_earnings || 0,
            rejected: 0
          });
        }
        
        // 2. Fetch transactions
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setTransactions(txData || []);

        // 3. Calculate from submissions (for comparison)
        const { data: submissionsData } = await supabase
          .from('job_submissions')
          .select('status, payment_amount')
          .eq('user_id', user.id);

        if (submissionsData) {
          const calculated = submissionsData.reduce((acc, submission) => {
            acc.total += submission.payment_amount || 0;
            
            switch (submission.status) {
              case 'pending':
                acc.pending += submission.payment_amount || 0;
                break;
              case 'approved':
                acc.approved += submission.payment_amount || 0;
                break;
              case 'rejected':
                acc.rejected += submission.payment_amount || 0;
                break;
            }
            return acc;
          }, { pending: 0, total: 0, approved: 0, rejected: 0 });
          
          console.log('CALCULATED FROM SUBMISSIONS:', calculated); // DEBUG
          console.log('FROM PROFILES TABLE:', freshProfile?.approved_earnings, freshProfile?.total_earnings); // DEBUG
        }
        
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

    // Add this useEffect to listen for real-time updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to profile changes
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('PROFILE UPDATED REAL-TIME:', payload.new);
          // Force refresh data
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /* ───────────────────── WITHDRAW HELPERS ───────────────────── */
  const lastWithdrawalDate = () => {
    const last = transactions.find(t => t.type === 'payout');
    return last ? new Date(last.created_at) : null;
  };

  const canWithdrawByDate = () => {
    const lastDate = lastWithdrawalDate();
    if (!lastDate) return true;

    const diff =
      (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= WITHDRAWAL_INTERVAL_DAYS;
  };

  /* ───────────────────── WITHDRAW ACTION ───────────────────── */
  const handleWithdrawRequest = async () => {
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      setWithdrawError('Enter a valid withdrawal amount.');
      return;
    }

    if (amount < MIN_WITHDRAWAL) {
      setWithdrawError('Minimum withdrawal is $1,000 USD.');
      return;
    }

    if (!canWithdrawByDate()) {
      setWithdrawError('Withdrawals are allowed only once every 14 days.');
      return;
    }

    if (amount > paymentSummary.approved) {
      setWithdrawError('Insufficient approved earnings.');
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch('/api/request-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          amount,
        }),
      });

      if (!res.ok) throw new Error();

      setWithdrawSuccess(
        'Withdrawal request submitted. Admin review in progress.'
      );
      setWithdrawAmount('');
    } catch {
      setWithdrawError(
        'Request failed due to unmet withdrawal requirements.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ───────────────────────── UI HELPERS ───────────────────────── */
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
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">
            Manage your income and withdrawals
          </p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Earnings"
            value={`$${paymentSummary.total.toFixed(2)}`}
            description="All submissions combined"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending"
            value={`$${paymentSummary.pending.toFixed(2)}`}
            description="Awaiting review"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Approved"
            value={`$${paymentSummary.approved.toFixed(2)}`}
            description="Ready for withdrawal"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Rejected"
            value={`$${paymentSummary.rejected.toFixed(2)}`}
            description="Not eligible for payment"
          />
        </div>

        {/* WITHDRAWAL SECTION */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Withdrawal Request</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-green-400">
                  ${paymentSummary.approved.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount you can withdraw now
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Withdrawal Amount (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    min="0"
                    max={paymentSummary.approved}
                  />
                </div>

                {withdrawError && (
                  <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                    <p className="text-sm text-red-400">{withdrawError}</p>
                  </div>
                )}

                {withdrawSuccess && (
                  <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                    <p className="text-sm text-green-400">{withdrawSuccess}</p>
                  </div>
                )}

                <button
                  onClick={handleWithdrawRequest}
                  disabled={isSubmitting || paymentSummary.approved === 0}
                  className="w-full px-6 py-3 bg-primary rounded-lg text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Withdrawal'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Withdrawal Requirements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentSummary.approved >= MIN_WITHDRAWAL ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                      {paymentSummary.approved >= MIN_WITHDRAWAL ? '✓' : '!'}
                    </div>
                    <span>Minimum: ${MIN_WITHDRAWAL.toFixed(2)}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${canWithdrawByDate() ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                      {canWithdrawByDate() ? '✓' : '!'}
                    </div>
                    <span>Wait {WITHDRAWAL_INTERVAL_DAYS} days between withdrawals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentSummary.approved > 0 ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                      {paymentSummary.approved > 0 ? '✓' : '!'}
                    </div>
                    <span>Available approved balance</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium mb-2">Next Available Withdrawal</h3>
                <p className="text-sm text-muted-foreground">
                  {canWithdrawByDate() 
                    ? 'You can withdraw now' 
                    : lastWithdrawalDate()
                    ? `Available in ${Math.ceil(WITHDRAWAL_INTERVAL_DAYS - ((Date.now() - lastWithdrawalDate()!.getTime()) / (1000 * 60 * 60 * 24)))} days`
                    : 'Available now'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EARNINGS BREAKDOWN */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Earnings Breakdown</h2>
          <div className="space-y-4">
            <EarningItem
              label="Pending Review"
              amount={paymentSummary.pending}
              percentage={(paymentSummary.pending / paymentSummary.total) * 100}
              color="bg-yellow-400"
            />
            <EarningItem
              label="Approved"
              amount={paymentSummary.approved}
              percentage={(paymentSummary.approved / paymentSummary.total) * 100}
              color="bg-green-400"
            />
            <EarningItem
              label="Rejected"
              amount={paymentSummary.rejected}
              percentage={(paymentSummary.rejected / paymentSummary.total) * 100}
              color="bg-red-400"
            />
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description || 'No description'}
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
                    <p className={`font-bold ${tx.type === 'earning' ? 'text-green-400' : 'text-foreground'}`}>
                      {tx.type === 'earning' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                      tx.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  description?: string;
}) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-xl text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

const EarningItem = ({
  label,
  amount,
  percentage,
  color,
}: {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-foreground">{label}</span>
      <span className="font-medium">${amount.toFixed(2)}</span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${percentage || 0}%` }}
      />
    </div>
    <p className="text-xs text-muted-foreground text-right">
      {percentage.toFixed(1)}% of total
    </p>
  </div>
);

export default Earnings;

function fetchData() {
  throw new Error('Function not implemented.');
}
