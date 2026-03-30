import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Key, CircleCheckBig } from 'lucide-react';

const VerifyOTP = () => {
    const location = useLocation();
    // Pre-fill email if passed from Registration page
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { verifyOTP } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const data = await verifyOTP(email, otp);
            // Navigate based on role after success
            if (data.role === 'admin') navigate('/admin/dashboard');
            else if (data.role === 'employee') navigate('/employee/dashboard');
            else navigate('/customer/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Verify Your Account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 max-w-sm mx-auto">
                    We've sent a 6-digit verification code to your email address. It is valid for 5 minutes.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 flex items-start">
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address
                            </label>
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
                                    readOnly={!!location.state?.email}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                6-Digit OTP
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-slate-300 placeholder-slate-400 text-slate-900 tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-lg font-bold bg-slate-50/50"
                                    placeholder="000000"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || otp.length < 6}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg"
                            >
                                <CircleCheckBig className="h-5 w-5 mr-2" />
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">
                                    Need help?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                            <Link to="/login">
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
