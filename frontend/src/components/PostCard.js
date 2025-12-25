import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function PostCard({ post, onValidate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showValidationAnimation, setShowValidationAnimation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleValidate = async () => {
    setShowValidationAnimation(true);
    await onValidate(post.id);
    setTimeout(() => setShowValidationAnimation(false), 1000);
  };

  return (
    <div 
      className="bg-white rounded-xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-zinc-300 transition-all duration-300 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="post-card"
    >
      {showValidationAnimation && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="validation-pulse text-6xl font-bold text-[#BEF264] animate-ping-once">
            +1
          </div>
        </div>
      )}

      <div className="relative aspect-video bg-black video-container group">
        <video
          src={`${BACKEND_URL}${post.video_url}`}
          controls
          preload="metadata"
          muted
          playsInline
          className="w-full h-full"
          data-testid="post-video"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none transition-opacity duration-300" />
        )}
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-medium text-zinc-950 mb-2 hover:text-[#047857] transition-colors cursor-pointer" data-testid="post-title">
            {post.title}
          </h3>
          <p className="text-base text-zinc-600 leading-relaxed" data-testid="post-description">
            {post.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <div className="flex items-center gap-4">
            {post.user && (
              <button
                onClick={() => navigate(`/profile/${post.user.id}`)}
                className="text-sm font-medium text-zinc-950 hover:text-[#047857] transition-colors hover:underline"
                data-testid="post-author-link"
              >
                {post.user.display_name}
              </button>
            )}
            <span className="text-sm text-zinc-500 uppercase tracking-wider" data-testid="post-validation-count">
              {post.validation_count} {post.validation_count === 1 ? 'validation' : 'validations'}
            </span>
          </div>

          {post.is_validated_by_me ? (
            <Button
              disabled
              className="h-11 px-6 rounded-full bg-zinc-100 text-zinc-500 font-bold uppercase tracking-wide cursor-not-allowed"
              data-testid="already-validated-button"
            >
              Validated ✓
            </Button>
          ) : (
            <Button
              onClick={handleValidate}
              className="h-11 px-6 rounded-full bg-[#BEF264] text-[#1A2E05] font-bold uppercase tracking-wide hover:bg-[#BEF264]/90 hover:brightness-110 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(190,242,100,0.3)] hover:shadow-[0_0_30px_rgba(190,242,100,0.5)]"
              data-testid="validate-button"
            >
              I Learned This
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}