import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Mail, Lock, KeyRound } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await login(email, password);
            showToast(`Welcome back, ${data.name}!`, 'success');
            if (data.role === 'admin') navigate('/admin/dashboard');
            else if (data.role === 'employee') navigate('/employee/dashboard');
            else navigate('/customer/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left side Branding */}
            <div className="hidden lg:flex w-1/2 bg-blue-600 justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-700 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-blue-600 to-transparent"></div>
                <div className="relative z-10 text-white p-12 text-center">
                    <Building2 className="w-24 h-24 mx-auto mb-6 text-blue-100" />
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Engineering Business BMS</h1>
                    <p className="text-blue-100 text-lg max-w-md mx-auto">
                        Streamlining engineering operations, inventory management, and billing in one unified platform.
                    </p>
                </div>
            </div>

            {/* Right side Form */}
            <div className="flex-1 flex justify-center items-center p-8 sm:p-12">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6 lg:hidden">
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4 shadow-sm">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm bg-slate-50/50"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm bg-slate-50/50"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <KeyRound className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                                </span>
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500">Don't have an account? </span>
                        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                            Sign up now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
