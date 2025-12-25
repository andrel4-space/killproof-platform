import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload as UploadIcon, CheckCircle2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [skillCategories, setSkillCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchSkillCategories();
  }, []);

  const fetchSkillCategories = async () => {
    try {
      const response = await axios.get(`${API}/skill-categories`);
      setSkillCategories(response.data.categories);
      setSelectedCategory(user?.skill_category || response.data.categories[0]);
    } catch (error) {
      console.error('Failed to fetch skill categories:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      toast.success('Video selected successfully!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData(e.target);
    formData.append('video', videoFile);

    try {
      await axios.post(`${API}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      setUploadProgress(100);
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Skill proof uploaded successfully!</span>
        </div>
      );
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed, please try again');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-zinc-950 tracking-tight mb-2">
            Upload Skill Proof
          </h1>
          <p className="text-base text-zinc-600">
            Share your knowledge in a 60-second video
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="What skill are you demonstrating?"
              required
              disabled={uploading}
              data-testid="upload-title-input"
              className="h-12 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide a brief description..."
              required
              disabled={uploading}
              rows={4}
              data-testid="upload-description-input"
              className="resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video (max 60 seconds)</Label>
            <div className="border-2 border-dashed border-zinc-200 rounded-lg p-8 text-center hover:border-[#047857] hover:bg-zinc-50 transition-all">
              {videoPreview ? (
                <div className="space-y-4">
                  <video
                    src={videoPreview}
                    controls
                    preload="metadata"
                    className="w-full max-h-64 rounded-lg mx-auto"
                    data-testid="video-preview"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="remove-video-button"
                  >
                    Remove Video
                  </Button>
                </div>
              ) : (
                <label htmlFor="video" className="cursor-pointer block">
                  <UploadIcon className="w-12 h-12 mx-auto text-zinc-400 mb-4" />
                  <p className="text-zinc-600 mb-2 font-medium">Click to upload video</p>
                  <p className="text-sm text-zinc-500">MP4, WebM, or other video formats</p>
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    disabled={uploading}
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="upload-video-input"
                  />
                </label>
              )}
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 font-medium">Uploading...</span>
                <span className="text-[#047857] font-bold">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => navigate('/')}
              className="flex-1 h-11 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="cancel-upload-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !videoFile}
              className="flex-1 h-11 rounded-full bg-[#047857] text-white font-medium hover:bg-[#047857]/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#047857]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              data-testid="submit-upload-button"
            >
              {uploading ? 'Uploading...' : 'Upload Skill Proof'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}