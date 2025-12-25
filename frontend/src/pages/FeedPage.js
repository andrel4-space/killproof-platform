import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, Search, Filter } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [skillCategories, setSkillCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSkillCategories();
    fetchPosts();
  }, []);

  const fetchSkillCategories = async () => {
    try {
      const response = await axios.get(`${API}/skill-categories`);
      setSkillCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch skill categories:', error);
    }
  };

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

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'all') params.append('skill_category', selectedCategory);
      
      const response = await axios.get(`${API}/posts/search?${params.toString()}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to search posts:', error);
      toast.error('Failed to search posts');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (postId) => {
    try {
      await axios.post(`${API}/posts/${postId}/validate`);
      toast.success('You learned this!');
      if (searchQuery || selectedCategory !== 'all') {
        handleSearch();
      } else {
        fetchPosts();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to validate');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950 tracking-tight">
              Skill Feed
            </h1>
            <p className="text-sm text-zinc-500 mt-1 uppercase tracking-wider">
              Discover and learn new skills
            </p>
          </div>
          <Button
            onClick={() => navigate('/upload')}
            className="h-11 px-6 rounded-full bg-[#047857] text-white font-medium hover:bg-[#047857]/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#047857]/20 hover:shadow-[#047857]/30"
            data-testid="upload-button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search by title, description, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-11 pl-10"
                data-testid="search-input"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-11 px-4"
              data-testid="filter-toggle"
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSearch}
              className="h-11 px-6 rounded-full bg-[#047857] text-white font-medium hover:bg-[#047857]/90 transition-colors"
              data-testid="search-button"
            >
              Search
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-zinc-200">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Filter by Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11" data-testid="category-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#047857]"></div>
            <p className="text-zinc-500 mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-zinc-600 mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No posts found matching your search' 
                : 'No skill proofs yet!'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button
                onClick={() => navigate('/upload')}
                className="h-11 px-8 rounded-full bg-[#047857] text-white font-medium hover:bg-[#047857]/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#047857]/20"
                data-testid="empty-upload-button"
              >
                Be the first to post
              </Button>
            )}
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