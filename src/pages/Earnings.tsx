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
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'earning' | 'payout' | 'subscription';
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
}

const MIN_WITHDRAWAL = 1000;
const WITHDRAWAL_INTERVAL_DAYS = 14;

const Earnings = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ───────────────────────────── AUTH ───────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  /* ───────────────────────── FETCH TXNS ───────────────────────── */
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setTransactions(data || []);
      setIsLoading(false);
    };

    fetchTransactions();
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

    if (!profile || amount > (profile.approved_earnings || 0)) {
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
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={<DollarSign />}
            label="Total Earnings"
            value={`$${profile?.total_earnings?.toFixed(2) || '0.00'}`}
          />
          <StatCard
            icon={<Clock />}
            label="Pending"
            value={`$${profile?.pending_earnings?.toFixed(2) || '0.00'}`}
          />
          <StatCard
            icon={<CheckCircle />}
            label="Approved"
            value={`$${profile?.approved_earnings?.toFixed(2) || '0.00'}`}
          />
        </div>

        {/* WITHDRAWAL */}
        <div className="glass-card p-6 max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Request Withdrawal</h2>

          <input
            type="number"
            placeholder="Amount in USD"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            className="w-full px-4 py-2 mb-3 rounded-lg bg-secondary border border-border"
          />

          {withdrawError && (
            <p className="text-sm text-red-400">{withdrawError}</p>
          )}

          {withdrawSuccess && (
            <p className="text-sm text-green-400">{withdrawSuccess}</p>
          )}

          <button
            onClick={handleWithdrawRequest}
            disabled={isSubmitting}
            className="mt-3 px-6 py-2 bg-primary rounded-lg text-primary-foreground font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Request Withdrawal'}
          </button>
        </div>

        {/* POLICY */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">
            Withdrawal Policy – Economic Rationale
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Compliance with global financial and AML regulations</li>
            <li>Ensures sustainable platform cash flow</li>
            <li>Reduces excessive banking and processing fees</li>
            <li>Prevents fraud and automated payout abuse</li>
            <li>Aligns with international settlement cycles</li>
          </ul>
        </div>

        {/* TRANSACTIONS */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>

          {isLoading ? (
            <p className="text-muted-foreground">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">
                    {tx.type === 'earning' ? '+' : '-'}$
                    {Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

/* ───────────────────────── SMALL COMPONENT ───────────────────────── */
const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
}) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-xl text-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default Earnings;
