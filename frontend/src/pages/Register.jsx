import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Mail, Lock, User, Briefcase, KeyRound } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register({ name, email, password, role });
            showToast('Account created successfully! Check your email for OTP.', 'success');
            // Redirect to OTP verification after successful registration
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
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
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Join our Platform</h1>
                    <p className="text-blue-100 text-lg max-w-md mx-auto">
                        Create an account to manage your engineering business smoothly and effortlessly.
                    </p>
                </div>
            </div>

            {/* Right side Form */}
            <div className="flex-1 flex justify-center items-center p-8 sm:p-12 overflow-y-auto">
                <div className="w-full max-w-md space-y-6 bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 my-auto">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 lg:hidden">
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Get started by creating your account today.
                        </p>
                    </div>

                    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm bg-slate-50/50"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

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

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-slate-400" />
                                </div>
                                <select
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm bg-slate-50/50 cursor-pointer"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <KeyRound className="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                                </span>
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
