import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Users,
  Gift,
  Copy,
  CheckCircle,
  Crown,
  TrendingUp,
  DollarSign,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referred_id: string;
  referred_tier: string;
  bonus_amount: number;
  status: string;
  created_at: string;
}

const ReferralSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isPremiumUser = profile?.membership_tier && profile.membership_tier !== 'none';
  const referralCode = profile?.referral_code;

  useEffect(() => {
    if (user && isPremiumUser) {
      fetchReferrals();
    } else {
      setIsLoading(false);
    }
  }, [user, isPremiumUser]);

  const fetchReferrals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`id, referred_id, referred_tier, bonus_amount, status, created_at`)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = async () => {
    if (!referralCode) return;
    
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: 'Failed to copy', description: 'Please copy the code manually', variant: 'destructive' });
    }
  };

  const totalReferralEarnings = profile?.referral_earnings || 0;
  const creditedReferrals = referrals.filter(r => r.status === 'credited').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

  // Non-premium user view - code exists but hidden
  if (!isPremiumUser) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Referral Program</h2>
            <p className="text-sm text-muted-foreground">Earn up to $2 for every friend you refer</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <Crown className="w-10 h-10 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Upgrade to See Your Referral Code</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your unique referral code has been generated! Activate your account with a premium plan to reveal it and start earning for every friend who subscribes.
              </p>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>$0.50 for Regular, $1 for Pro, $2 for VIP referrals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Bonus credited when your referral subscribes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Withdraw once you reach $30</span>
                </li>
              </ul>
              <Button variant="hero" asChild>
                <a href="/pricing">Upgrade Now</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referral Earnings</p>
              <p className="text-2xl font-bold text-green-400">${totalReferralEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credited Referrals</p>
              <p className="text-2xl font-bold text-foreground">{creditedReferrals}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Referrals</p>
              <p className="text-2xl font-bold text-foreground">{pendingReferrals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Display */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your Referral Code</h2>
            <p className="text-sm text-muted-foreground">Share this code with friends to earn up to $2 per referral</p>
          </div>
        </div>

        {referralCode ? (
          <div className="space-y-4">
            {/* Big code display */}
            <div className="flex items-center justify-center gap-4 p-6 rounded-xl bg-secondary/50 border border-border">
              <span className="text-4xl md:text-5xl font-mono font-bold tracking-[0.5em] text-primary">
                {referralCode}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={copyCode}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button onClick={copyCode} className="gap-2">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>

            {/* How it works */}
            <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium mb-3">How It Works</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Share your 6-digit code with friends</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>They enter your code during sign up</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Bonus appears as pending in your account ($0.50–$2 based on their plan)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <span>Once they pay for a subscription, your bonus is credited</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                  <span>Withdraw when you reach $30</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Your referral code is being generated...</p>
            <Button onClick={() => refreshProfile()}>Refresh</Button>
          </div>
        )}
      </div>

      {/* Referral History */}
      {referrals.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Referral History</h3>
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Referral</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    referral.status === 'credited' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {referral.status === 'credited' ? `+$${referral.bonus_amount}` : 'Pending'}
                  </p>
                  <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                    referral.status === 'credited' 
                      ? 'bg-green-400/10 text-green-400' 
                      : 'bg-yellow-400/10 text-yellow-400'
                  }`}>
                    {referral.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralSection;
