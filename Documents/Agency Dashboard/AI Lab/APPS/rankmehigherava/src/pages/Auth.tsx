import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { z } from 'zod';
import AvaAvatar from '@/components/agency/AvaAvatar';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: Location })?.from?.pathname || '/avaadminpanel';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const validateForm = (isSignUp: boolean = false) => {
    try {
      const schema = isSignUp ? signUpSchema : signInSchema;
      schema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Account exists',
          description: 'This email is already registered. Please sign in instead.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Account created!',
        description: 'You can now sign in with your credentials.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <Card className="w-full max-w-md relative z-10 border-cyan-400/30 overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.3)]">
        {/* Brain-themed card background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-blue-950/40 backdrop-blur-xl" />

        {/* Blurred neural network background pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-10 blur-sm" viewBox="0 0 400 600">
          <defs>
            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Neural network nodes */}
          <circle cx="200" cy="100" r="8" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" />
          <circle cx="120" cy="150" r="6" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
          <circle cx="280" cy="150" r="6" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="80" cy="250" r="7" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="200" cy="250" r="9" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
          <circle cx="320" cy="250" r="7" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <circle cx="150" cy="350" r="6" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
          <circle cx="250" cy="350" r="6" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: '1.4s' }} />
          <circle cx="200" cy="450" r="8" fill="url(#brainGradient)" filter="url(#glow)" className="animate-pulse" style={{ animationDelay: '1.6s' }} />

          {/* Neural connections */}
          <line x1="200" y1="100" x2="120" y2="150" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="200" y1="100" x2="280" y2="150" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="120" y1="150" x2="80" y2="250" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="120" y1="150" x2="200" y2="250" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="280" y1="150" x2="200" y2="250" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="280" y1="150" x2="320" y2="250" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="80" y1="250" x2="150" y2="350" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="200" y1="250" x2="150" y2="350" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="200" y1="250" x2="250" y2="350" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="320" y1="250" x2="250" y2="350" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="150" y1="350" x2="200" y2="450" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
          <line x1="250" y1="350" x2="200" y2="450" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" />
        </svg>

        {/* Animated scan lines */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-scan" />
        </div>

        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/20 shadow-[inset_0_0_60px_rgba(6,182,212,0.1)]" />

        <CardHeader className="text-center space-y-6 pb-8 relative z-10">
          {/* AVA Brain Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <AvaAvatar />
            </div>
          </div>

          <div className="space-y-3">
            <CardTitle className="text-4xl font-orbitron font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              AVA
            </CardTitle>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <span className="text-xs font-orbitron tracking-[0.2em] text-cyan-300 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">Advanced Virtual Assistant</span>
            </div>
            <CardDescription className="text-cyan-100/80 font-orbitron text-sm">
              Access the AI Command Center
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-sm">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 font-orbitron"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 font-orbitron"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="font-orbitron text-xs tracking-wider text-cyan-200">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-300/80" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-blue-950/30 border-cyan-400/30 focus:border-cyan-300/60 font-orbitron text-cyan-100 placeholder:text-cyan-300/40 backdrop-blur-sm"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="font-orbitron text-xs tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-cyan-400/20 focus:border-cyan-400/50 font-orbitron"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-orbitron tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-orbitron text-xs tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50 border-cyan-400/20 focus:border-cyan-400/50 font-orbitron"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-orbitron text-xs tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-cyan-400/20 focus:border-cyan-400/50 font-orbitron"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-orbitron tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
