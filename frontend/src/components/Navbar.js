import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Trophy } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
              onClick={() => navigate('/leaderboard')}
              className="hover:bg-zinc-100"
              data-testid="navbar-leaderboard-button"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="hover:bg-zinc-100 flex items-center gap-2"
              data-testid="navbar-profile-button"
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={user?.avatar_url ? `${BACKEND_URL}${user.avatar_url}` : undefined} />
                <AvatarFallback className="bg-[#047857]/10 text-[#047857] text-xs font-semibold">
                  {user?.display_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
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