import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Home,
  Briefcase,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  User,
  Shield,
  Gift,
  Download,
  Play,
  Heart,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Available Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Watch & Earn', href: '/watch-tasks', icon: Play },
    { name: 'Follow & Earn', href: '/follow-tasks', icon: Heart },
    { name: 'My Submissions', href: '/submissions', icon: FileText },
    { name: 'Earnings', href: '/earnings', icon: Wallet },
    { name: 'Referrals', href: '/referrals', icon: Gift },
    { name: 'Withdrawals', href: '/withdrawals', icon: Download },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminItems = [
    { name: 'Admin Panel', href: '/admin', icon: Shield },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip':
        return 'text-yellow-400';
      case 'pro':
        return 'text-primary';
      case 'regular':
        return 'text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'none') return null;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary ${getTierColor(tier)}`}>
        {tier === 'vip' && <Crown className="w-3 h-3" />}
        {tier.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="font-bold">SkillBridge</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-foreground"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 h-16 px-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold">
                Skill<span className="text-primary">Bridge</span>
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-2">
                  {profile && getTierBadge(profile.membership_tier)}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin
                  </p>
                </div>
                {adminItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Upgrade CTA */}
          {profile?.membership_tier === 'none' && (
            <div className="p-4 border-t border-border">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Crown className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-semibold text-foreground mb-1">Upgrade to Pro</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Unlock more jobs and features
                </p>
                <Button variant="hero" size="sm" className="w-full" asChild>
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Sign Out */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
