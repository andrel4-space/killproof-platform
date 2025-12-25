import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (postId) => {
    try {
      await axios.post(`${API}/posts/${postId}/validate`);
      toast.success('You learned this!');
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to validate');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950 tracking-tight">
              Skill Feed
            </h1>
            <p className="text-sm text-zinc-500 mt-1 uppercase tracking-wider">
              Explain one idea clearly in 60 seconds
            </p>
          </div>
          <Button
            onClick={() => navigate('/upload')}
            className="h-11 px-6 rounded-full bg-[#047857] text-white font-medium hover:bg-[#047857]/90 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#047857]/20"
            data-testid="upload-button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
            <p className="text-zinc-600 mb-4">No skill proofs yet!</p>
            <Button
              onClick={() => navigate('/upload')}
              className="h-11 px-8 rounded-full bg-[#047857] text-white font-medium hover:bg-[#047857]/90 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#047857]/20"
              data-testid="empty-upload-button"
            >
              Be the first to post
            </Button>
          </div>
        ) : (
          <div className="space-y-8" data-testid="posts-feed">
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