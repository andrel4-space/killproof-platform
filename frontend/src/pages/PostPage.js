import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showValidationAnimation, setShowValidationAnimation] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      setShowValidationAnimation(true);
      await axios.post(`${API}/posts/${postId}/validate`);
      toast.success('You learned this!');
      fetchPost();
      setTimeout(() => setShowValidationAnimation(false), 1000);
    } catch (error) {
      setShowValidationAnimation(false);
      toast.error(error.response?.data?.detail || 'Failed to validate');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#047857]"></div>
          <p className="text-zinc-500 mt-4">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="text-center py-12 text-zinc-500">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-zinc-100 hover:scale-105 transition-all"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden relative">
          {showValidationAnimation && (
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
              <div className="validation-pulse text-8xl font-bold text-[#BEF264] animate-ping-once">
                +1
              </div>
            </div>
          )}

          <div className="relative bg-black video-container" style={{ minHeight: '400px', maxHeight: '80vh' }}>
            <video
              src={`${BACKEND_URL}${post.video_url}`}
              controls
              autoPlay={false}
              preload="metadata"
              playsInline
              className="w-full h-full"
              data-testid="post-video"
            />
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-medium text-zinc-950 mb-2" data-testid="post-title">
                {post.title}
              </h1>
              <p className="text-base text-zinc-600 leading-relaxed" data-testid="post-description">
                {post.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              <div>
                <button
                  onClick={() => navigate(`/profile/${post.user.id}`)}
                  className="text-sm font-medium text-zinc-950 hover:text-[#047857] transition-colors hover:underline"
                  data-testid="post-author-link"
                >
                  {post.user.display_name}
                </button>
                <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">
                  {post.validation_count} {post.validation_count === 1 ? 'person' : 'people'} learned this
                </p>
              </div>

              {post.is_validated_by_me ? (
                <Button
                  disabled
                  className="h-12 px-8 rounded-full bg-zinc-100 text-zinc-500 font-bold uppercase tracking-wide cursor-not-allowed"
                  data-testid="already-validated-button"
                >
                  Validated ✓
                </Button>
              ) : (
                <Button
                  onClick={handleValidate}
                  className="h-12 px-8 rounded-full bg-[#BEF264] text-[#1A2E05] font-bold uppercase tracking-wide hover:bg-[#BEF264]/90 hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.5)]"
                  data-testid="validate-button"
                >
                  I Learned This
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}