import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Crown,
  Calendar,
  Shield,
  Save,
} from 'lucide-react';

const Settings = () => {
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } else {
      await refreshProfile();
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    }

    setIsSaving(false);
  };

  const getTierInfo = () => {
    switch (profile?.membership_tier) {
      case 'vip':
        return { name: 'VIP', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
      case 'pro':
        return { name: 'Pro', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' };
      case 'regular':
        return { name: 'Regular', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
      default:
        return { name: 'Free', color: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border' };
    }
  };

  const tierInfo = getTierInfo();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile and account preferences
          </p>
        </div>

        {/* Profile Settings */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 bg-secondary/30"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <Button type="submit" variant="hero" disabled={isSaving}>
              {isSaving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Membership Info */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Membership
          </h2>
          <div className={`p-4 rounded-lg ${tierInfo.bg} border ${tierInfo.border} mb-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className={`text-xl font-bold ${tierInfo.color}`}>{tierInfo.name}</p>
              </div>
              {profile?.membership_expires_at && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="text-foreground">
                    {new Date(profile.membership_expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Daily Task Limit</span>
              <span className="text-foreground font-medium">
                {profile?.membership_tier === 'vip' ? 'Unlimited' :
                  profile?.membership_tier === 'pro' ? '6 tasks' :
                  profile?.membership_tier === 'regular' ? '4 tasks' : '0 tasks'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Tasks Used Today</span>
              <span className="text-foreground font-medium">{profile?.daily_tasks_used || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Total Tasks Completed</span>
              <span className="text-foreground font-medium">{profile?.tasks_completed || 0}</span>
            </div>
          </div>

          {profile?.membership_tier !== 'vip' && (
            <Button variant="premium" className="w-full mt-4" onClick={() => navigate('/pricing')}>
              Upgrade Membership
            </Button>
          )}
        </div>

        {/* Account Stats */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Member Since</span>
              <span className="text-foreground font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Total Earnings</span>
              <span className="text-primary font-medium">
                ${profile?.total_earnings?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Rating</span>
              <span className="text-foreground font-medium">
                {profile?.rating ? `${profile.rating.toFixed(1)} / 5.0` : 'Not rated yet'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
