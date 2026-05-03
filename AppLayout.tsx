import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Home,
  Library,
  Dumbbell,
  MapPin,
  FileText,
  Bell,
  Calendar,
  BarChart3,
  Settings,
  Users,
  Menu,
  LogOut,
  Shield,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const studentNavItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Library, label: 'Question Bank', path: '/question-bank' },
  { icon: Dumbbell, label: 'Practice', path: '/practice' },
  { icon: MapPin, label: 'Geographic Quiz', path: '/geographic-quiz' },
  { icon: FileText, label: 'Exams', path: '/exams' },
  { icon: BarChart3, label: 'My Results', path: '/results' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Calendar, label: 'Routine', path: '/routine' },
];

const adminNavItems = [
  { icon: Shield, label: 'Admin Dashboard', path: '/admin' },
  { icon: Settings, label: 'Content Management', path: '/admin/content' },
  { icon: Users, label: 'User Management', path: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
];

function NavLinks({ items, onNavigate }: { items: typeof studentNavItems; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">BCS Exam Prep</h1>
            <p className="text-xs text-muted-foreground">Learn & Excel</p>
          </div>
        </Link>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-6">
          <div>
            <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Student
            </h2>
            <NavLinks items={studentNavItems} />
          </div>

          {profile?.role === 'admin' && (
            <>
              <Separator />
              <div>
                <h2 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </h2>
                <NavLinks items={adminNavItems} />
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 space-y-2">
        <div className="px-3 py-2 rounded-lg bg-muted">
          <p className="text-sm font-medium">{profile?.username}</p>
          <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden lg:block w-64 border-r border-border bg-card shrink-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="lg:hidden sticky top-0 z-50 w-full border-b border-border bg-card">
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">BCS Exam Prep</span>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
