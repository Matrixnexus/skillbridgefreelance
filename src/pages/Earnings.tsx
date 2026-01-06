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
} from 'lucide-react';

interface SubmissionEarning {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_amount: number;
  created_at: string;
}

const MIN_WITHDRAWAL = 1000;
const WITHDRAWAL_INTERVAL_DAYS = 14;

const Earnings = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState<SubmissionEarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ───────────────────── AUTH ───────────────────── */
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  /* ───────────────── FETCH EARNINGS ───────────────── */
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('job_submissions')
        .select('id, status, payment_amount, created_at')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false });

      setEarnings((data as SubmissionEarning[]) || []);
      setIsLoading(false);
    };

    fetchEarnings();
  }, [user]);

  /* ───────────────── CALCULATED STATS ───────────────── */
  const pendingEarnings = earnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.payment_amount, 0);

  const approvedEarnings = earnings
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.payment_amount, 0);

  const totalEarnings = pendingEarnings + approvedEarnings;

  /* ───────────────── WITHDRAW HELPERS ───────────────── */
  const lastWithdrawalDate = async (): Promise<Date | null> => {
    const { data } = await supabase
      .from('transactions')
      .select('created_at')
      .eq('user_id', user?.id)
      .eq('type', 'payout')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data ? new Date(data.created_at) : null;
  };

  /* ───────────────── WITHDRAW ACTION ───────────────── */
  const handleWithdrawRequest = async () => {
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      setWithdrawError('Enter a valid withdrawal amount.');
      return;
    }

    if (amount < MIN_WITHDRAWAL) {
      setWithdrawError('Minimum withdrawal amount is $1,000 USD.');
      return;
    }

    if (amount > approvedEarnings) {
      setWithdrawError('Insufficient approved earnings.');
      return;
    }

    const lastDate = await lastWithdrawalDate();
    if (lastDate) {
      const diff =
        (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff < WITHDRAWAL_INTERVAL_DAYS) {
        setWithdrawError('Withdrawals are allowed once every 14 days.');
        return;
      }
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
        'Withdrawal request submitted successfully. Admin review pending.'
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

  /* ───────────────── UI ───────────────── */
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
          <p className="text-muted-foreground">
            Earnings calculated from approved and pending submissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={<DollarSign />}
            label="Total Earnings"
            value={`$${totalEarnings.toFixed(2)}`}
          />
          <StatCard
            icon={<Clock />}
            label="Pending Earnings"
            value={`$${pendingEarnings.toFixed(2)}`}
          />
          <StatCard
            icon={<CheckCircle />}
            label="Approved Earnings"
            value={`$${approvedEarnings.toFixed(2)}`}
          />
        </div>

        {/* Withdrawal */}
        <div className="glass-card p-6 max-w-lg">
          <h2 className="text-lg font-semibold mb-4">Request Withdrawal</h2>

          <input
            type="number"
            placeholder="Amount in USD"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border"
          />

          {withdrawError && (
            <p className="text-sm text-red-400 mt-2">{withdrawError}</p>
          )}
          {withdrawSuccess && (
            <p className="text-sm text-green-400 mt-2">{withdrawSuccess}</p>
          )}

          <button
            onClick={handleWithdrawRequest}
            disabled={isSubmitting}
            className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Request Withdrawal'}
          </button>
        </div>

        {/* Policy */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-3">
            Withdrawal Policy – Economic Rationale
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Compliance with global financial and AML regulations</li>
            <li>Ensures stable platform cash flow</li>
            <li>Reduces excessive banking transaction fees</li>
            <li>Prevents fraudulent or automated payout abuse</li>
            <li>Aligns with international settlement cycles</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* ───────────── Reusable Stat Card ───────────── */
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
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export default Earnings;
