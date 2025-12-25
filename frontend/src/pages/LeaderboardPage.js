import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Trophy, Award, Video } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-8 h-8 text-[#047857]" />
            <h1 className="text-3xl font-semibold text-zinc-950 tracking-tight">
              Leaderboard
            </h1>
          </div>
          <p className="text-base text-zinc-600">
            Top contributors by validations received
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#047857]"></div>
            <p className="text-zinc-500 mt-4">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-zinc-600">No users yet!</p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="leaderboard-list">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-zinc-300 transition-all cursor-pointer"
                onClick={() => navigate(`/profile/${user.id}`)}
                data-testid={`leaderboard-item-${index}`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {index === 0 && (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl">
                        1
                      </div>
                    )}
                    {index === 1 && (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold text-xl">
                        2
                      </div>
                    )}
                    {index === 2 && (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                        3
                      </div>
                    )}
                    {index > 2 && (
                      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold text-xl">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.avatar_url ? `${BACKEND_URL}${user.avatar_url}` : undefined} />
                    <AvatarFallback className="bg-[#047857]/10 text-[#047857] text-lg font-semibold">
                      {user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-950 mb-1">
                      {user.display_name}
                    </h3>
                    <p className="text-sm text-zinc-500 uppercase tracking-wider">
                      {user.skill_category}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8">
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-[#BEF264]" />
                        <span className="text-2xl font-bold text-zinc-950">
                          {user.validations_received}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">
                        Validations
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Video className="w-4 h-4 text-[#047857]" />
                        <span className="text-2xl font-bold text-zinc-950">
                          {user.posts_count}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">
                        Posts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}