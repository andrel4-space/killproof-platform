import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { toast } from 'sonner';
import { Award, Video } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleValidate = async (postId) => {
    try {
      await axios.post(`${API}/posts/${postId}/validate`);
      toast.success('You learned this!');
      fetchPosts();
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to validate');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="text-center py-12 text-zinc-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="text-center py-12 text-zinc-500">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-950 mb-2 tracking-tight" data-testid="profile-display-name">
            {profile.display_name}
          </h1>
          <p className="text-sm text-zinc-500 uppercase tracking-wider">
            Skill Category: Explain one idea clearly in 60 seconds
          </p>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="stat-card bg-white rounded-xl border border-zinc-200 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" data-testid="posts-stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#047857]/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-[#047857]" />
              </div>
              <p className="text-sm text-zinc-500 uppercase tracking-wider">Posts</p>
            </div>
            <p className="text-4xl font-bold text-zinc-950">{profile.posts_count}</p>
          </div>

          <div className="stat-card bg-white rounded-xl border border-zinc-200 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" data-testid="validations-stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#BEF264]/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#1A2E05]" />
              </div>
              <p className="text-sm text-zinc-500 uppercase tracking-wider">Validations</p>
            </div>
            <p className="text-4xl font-bold text-zinc-950">{profile.validations_received}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-medium text-zinc-950 tracking-tight">
            Skill Proofs
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
            <p className="text-zinc-600">
              {currentUser?.id === userId
                ? "You haven't posted any skill proofs yet"
                : "This user hasn't posted any skill proofs yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-8" data-testid="profile-posts">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onValidate={handleValidate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}