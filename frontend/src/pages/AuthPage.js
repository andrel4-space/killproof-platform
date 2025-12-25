import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [skillCategories, setSkillCategories] = useState([]);

  useEffect(() => {
    fetchSkillCategories();
  }, []);

  const fetchSkillCategories = async () => {
    try {
      const response = await axios.get(`${API}/skill-categories`);
      setSkillCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch skill categories:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    try {
      await login(formData.get('email'), formData.get('password'));
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    try {
      await register(
        formData.get('email'),
        formData.get('password'),
        formData.get('display_name'),
        formData.get('skill_category')
      );
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-950 mb-3 tracking-tight">
            SkillProof
          </h1>
          <p className="text-base text-zinc-600">
            Share your skills in 60 seconds
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    data-testid="login-email-input"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    data-testid="login-password-input"
                    className="h-12"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-full bg-[#047857] text-white font-medium hover:bg-[#047857]/90 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#047857]/20"
                  data-testid="login-submit-button"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Display Name</Label>
                  <Input
                    id="register-name"
                    name="display_name"
                    type="text"
                    placeholder="Your name"
                    required
                    data-testid="register-name-input"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    data-testid="register-email-input"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    data-testid="register-password-input"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-skill-category">Skill Category</Label>
                  <Select name="skill_category" defaultValue={skillCategories[0]} required>
                    <SelectTrigger className="h-12" data-testid="register-skill-category-select">
                      <SelectValue placeholder="Select a skill category" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-full bg-[#047857] text-white font-medium hover:bg-[#047857]/90 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#047857]/20"
                  data-testid="register-submit-button"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}