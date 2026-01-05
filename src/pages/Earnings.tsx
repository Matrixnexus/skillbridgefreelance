import { useState, useEffect } from 'react';
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
  type: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
}

const Earnings = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setTransactions(data);
      }
      setIsLoading(false);
    };

    fetchTransactions();
  }, [user]);

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
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-muted-foreground bg-secondary';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Earnings</h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings and payment history
          </p>
        </div>

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-foreground">
                  ${profile?.total_earnings?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Earnings</p>
                <p className="text-3xl font-bold text-foreground">
                  ${profile?.pending_earnings?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-400/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Earnings</p>
                <p className="text-3xl font-bold text-foreground">
                  ${profile?.approved_earnings?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* How Payments Work */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">How Payments Work</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Submit Work</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete and submit tasks for review
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Admin Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your submission for quality
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Approval & Payment</h4>
                  <p className="text-sm text-muted-foreground">
                    Approved work earnings are added to your balance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Withdrawal</h4>
                  <p className="text-sm text-muted-foreground">
                    Request payout based on your membership tier schedule
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Schedule */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payout Schedule</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Regular Members</span>
                  <span className="text-sm text-muted-foreground">Weekly</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Payouts processed every Friday
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Pro Members</span>
                  <span className="text-sm text-primary">Bi-weekly</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Payouts processed every other Wednesday
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">VIP Members</span>
                  <span className="text-sm text-yellow-400">Weekly Instant</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Instant payouts every Friday with priority processing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Transaction History</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {transaction.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'earning' ? 'text-green-400' : 'text-foreground'}`}>
                      {transaction.type === 'earning' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete jobs to start earning money
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Earnings;
