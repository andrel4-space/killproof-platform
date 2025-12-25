import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-white border-b border-zinc-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-zinc-950 hover:text-[#047857] transition-colors"
            data-testid="navbar-logo"
          >
            SkillProof
          </button>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="hover:bg-zinc-100"
              data-testid="navbar-profile-button"
            >
              <User className="w-4 h-4 mr-2" />
              {user?.display_name}
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hover:bg-zinc-100"
              data-testid="navbar-logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}