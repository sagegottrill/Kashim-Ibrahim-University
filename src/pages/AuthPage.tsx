import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, Phone, Building2, ArrowRight, Loader2, ShieldCheck, Briefcase } from 'lucide-react';

export default function AuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Welcome back!",
                description: "You have successfully logged in.",
            });

            const state = location.state as { returnTo?: string; view?: string } | null;
            if (state?.returnTo) {
                navigate(`${state.returnTo}${state.view ? `?view=${state.view}` : ''}`);
            } else {
                navigate(isAdminLogin ? '/admin' : '/dashboard');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login failed",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user meta info to Supabase
            const { error: dbError } = await supabase
                .from('users')
                .insert([
                    {
                        id: user.uid,
                        email: user.email,
                        full_name: fullName,
                        phone: phone,
                    }
                ]);

            if (dbError) {
                console.error("Error saving user details:", dbError);
                toast({
                    variant: "destructive",
                    title: "Warning",
                    description: "Account created but profile details could not be saved.",
                });
            }

            toast({
                title: "Account created!",
                description: "Welcome to the recruitment portal.",
            });

            const state = location.state as { returnTo?: string; view?: string } | null;
            if (state?.returnTo) {
                navigate(`${state.returnTo}${state.view ? `?view=${state.view}` : ''}`);
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration failed",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-gray-50">
            {/* Left Side - Visual Showcase */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] relative overflow-hidden items-center justify-center text-white p-12">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/95 to-[#4a9d7e]/80"></div>

                {/* Content */}
                <div className="relative z-10 max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold leading-tight tracking-tight">
                            Begin Your Journey <br />
                            <span className="text-[#4a9d7e]">With KIUTH</span>
                        </h1>
                        <p className="text-lg text-blue-100/90 leading-relaxed font-light">
                            Join a team dedicated to excellence in healthcare delivery, research, and training. Your career at Kashim Ibrahim University Teaching Hospital starts here.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <div className="flex items-center gap-3 text-sm font-medium bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-[#4a9d7e]" />
                            <span>Secure Portal</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10">
                            <Briefcase className="w-4 h-4 text-[#4a9d7e]" />
                            <span>Career Growth</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#4a9d7e]/20 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 fill-mode-forwards">

                    {/* Header Text */}
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-[#1e3a5f]">
                            {isAdminLogin ? 'Admin Access' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-500">
                            {isAdminLogin
                                ? 'Enter your credentials to access the admin dashboard'
                                : 'Sign in to manage your application or create a new account'}
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        {isAdminLogin ? (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-email">Admin Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="admin-email"
                                            type="email"
                                            placeholder="admin@kiuth.edu.ng"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="admin-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11 bg-[#1e3a5f] hover:bg-[#162c4b] transition-all duration-300 shadow-lg shadow-blue-900/20" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Access Portal <ArrowRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <Tabs defaultValue="login" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100/80 rounded-xl">
                                    <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1e3a5f] data-[state=active]:shadow-sm transition-all">Login</TabsTrigger>
                                    <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1e3a5f] data-[state=active]:shadow-sm transition-all">Register</TabsTrigger>
                                </TabsList>

                                <TabsContent value="login" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <form onSubmit={handleLogin} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="password">Password</Label>
                                                <a href="#" className="text-xs text-[#4a9d7e] hover:underline font-medium">Forgot password?</a>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-11 bg-[#4a9d7e] hover:bg-[#3d8568] transition-all duration-300 shadow-lg shadow-green-900/20" disabled={isLoading}>
                                            {isLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Sign In <ArrowRight className="w-4 h-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>

                                <TabsContent value="register" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="full-name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="full-name"
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+234..."
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="register-email"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="register-password">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="register-password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-11 bg-[#1e3a5f] hover:bg-[#162c4b] transition-all duration-300 shadow-lg shadow-blue-900/20" disabled={isLoading}>
                                            {isLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Create Account <ArrowRight className="w-4 h-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        )}

                        {/* Toggle Admin/User */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500 mb-3">
                                {isAdminLogin ? 'Looking to apply for a job?' : 'Are you an administrator?'}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdminLogin(!isAdminLogin);
                                    setEmail('');
                                    setPassword('');
                                }}
                                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 ${isAdminLogin
                                        ? 'text-[#4a9d7e] bg-green-50 hover:bg-green-100'
                                        : 'text-[#1e3a5f] bg-blue-50 hover:bg-blue-100'
                                    }`}
                            >
                                {isAdminLogin ? 'Switch to Applicant Login' : 'Switch to Admin Portal'}
                            </button>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="text-center space-x-6 text-sm text-gray-400">
                        <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-gray-600 transition-colors">Help Center</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
