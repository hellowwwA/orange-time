import React, { useState } from 'react';
import { enableGuestMode, getGitHubAuthUrl } from '../utils/auth';

/**
 * Login page component with glassmorphic design matching Orange Time style
 */
const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGitHubLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const authUrl = await getGitHubAuthUrl();
            window.location.href = authUrl;
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to initiate GitHub login. Please try again.');
            setLoading(false);
        }
    };

    const handleGuestAccess = () => {
        setError(null);
        enableGuestMode();
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50/30 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
                backgroundSize: '32px 32px'
            }}></div>

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md mx-4 animate-slide-up">
                {/* Glassmorphic card */}
                <div className="bg-white/50 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_8px_40px_0_rgba(249,115,22,0.12)] p-8 sm:p-10">
                    {/* Logo and branding */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 flex items-center justify-center mb-5 hover:rotate-12 transition-all duration-500 cursor-default animate-pulse-glow">
                            <span className="material-symbols-outlined text-3xl text-white">nutrition</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                            Orange Time
                        </h1>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Task Management Made Beautiful</p>
                    </div>

                    {/* Welcome message */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome Back!</h2>
                        <p className="text-slate-500 text-sm">Sign in to access your tasks and timeline</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl animate-fade-in">
                            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                                <span className="material-symbols-outlined text-lg">error</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* GitHub login button */}
                    <button
                        onClick={handleGitHubLogin}
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/25 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 group cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Connecting to GitHub...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                <span>Continue with GitHub</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleGuestAccess}
                        disabled={loading}
                        className="w-full mt-3 bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50/30 text-slate-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[20px] text-orange-500">visibility</span>
                        <span>Continue as Guest (Readonly)</span>
                    </button>

                    {/* Separator */}
                    <div className="mt-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200/60"></div>
                        <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Secure Login</span>
                        <div className="flex-1 h-px bg-slate-200/60"></div>
                    </div>

                    {/* Additional info */}
                    <div className="mt-4 text-center">
                        <p className="text-[11px] text-slate-400">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-slate-400">
                    <p>Don't have a GitHub account? <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover font-semibold transition-colors">Create one</a></p>
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
};

export default Login;
