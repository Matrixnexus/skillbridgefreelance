import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Gift,
  Copy,
  CheckCircle,
  Crown,
  TrendingUp,
  DollarSign,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  referred_id: string;
  referred_tier: string;
  bonus_amount: number;
  status: string;
  created_at: string;
  referred_user?: {
    full_name: string | null;
    email: string;
  };
}

const ReferralSection = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isPremiumUser = profile?.membership_tier && profile.membership_tier !== 'none';
  const referralCode = profile?.referral_code;
  const referralLink = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode}` 
    : null;

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
        .select(`
          id,
          referred_id,
          referred_tier,
          bonus_amount,
          status,
          created_at
        `)
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

  const copyToClipboard = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const shareOnSocial = (platform: 'twitter' | 'whatsapp' | 'telegram') => {
    if (!referralLink) return;
    
    const message = encodeURIComponent(
      `Join SkillBridge and start earning! Use my referral link to get started: ${referralLink}`
    );
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${message}`,
      whatsapp: `https://wa.me/?text=${message}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${message}`,
    };
    
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  const totalReferralEarnings = profile?.referral_earnings || 0;
  const creditedReferrals = referrals.filter(r => r.status === 'credited').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

  // Non-premium user view
  if (!isPremiumUser) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Referral Program</h2>
            <p className="text-sm text-muted-foreground">Earn bonus cash by inviting friends</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <Crown className="w-10 h-10 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Upgrade to Unlock Referrals</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Premium members can earn bonus cash for every friend they refer who joins with a paid membership:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>$5 bonus for Regular tier referrals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>$10 bonus for Pro tier referrals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>$15 bonus for VIP tier referrals</span>
                </li>
              </ul>
              <Button variant="hero" className="mt-4" asChild>
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
              <p className="text-sm text-muted-foreground">Successful Referrals</p>
              <p className="text-2xl font-bold text-foreground">{creditedReferrals}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Referrals</p>
              <p className="text-2xl font-bold text-foreground">{pendingReferrals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your Referral Link</h2>
            <p className="text-sm text-muted-foreground">Share this link to earn bonus cash</p>
          </div>
        </div>

        {referralCode ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Input
                  value={referralLink || ''}
                  readOnly
                  className="pr-12 font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button onClick={copyToClipboard}>
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Share on:</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnSocial('twitter')}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnSocial('whatsapp')}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => shareOnSocial('telegram')}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Telegram
              </Button>
            </div>

            {/* Bonus Structure */}
            <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-medium mb-3">Referral Bonus Structure</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-green-400">$5</p>
                  <p className="text-xs text-muted-foreground">Regular Tier</p>
                </div>
                <div className="p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-blue-400">$10</p>
                  <p className="text-xs text-muted-foreground">Pro Tier</p>
                </div>
                <div className="p-3 rounded-lg bg-background">
                  <p className="text-2xl font-bold text-primary">$15</p>
                  <p className="text-xs text-muted-foreground">VIP Tier</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Your referral code is being generated...
            </p>
            <Button onClick={() => refreshProfile()}>
              Refresh
            </Button>
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
                    <p className="font-medium text-foreground">
                      {referral.referred_tier.charAt(0).toUpperCase() + referral.referred_tier.slice(1)} Member
                    </p>
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
                  <p className={`text-xs px-2 py-0.5 rounded-full ${
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
