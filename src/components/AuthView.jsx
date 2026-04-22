import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthView({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Pendaftaran berhasil! Silakan login (atau periksa email Anda jika menggunakan konfirmasi email).');
                setIsLogin(true);
            }
            if (isLogin && onAuthSuccess) {
                onAuthSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
                    Masuk ke Skripsi Assistant
                </h2>
                <p className="text-center text-slate-500 mb-8 text-sm">
                    {isLogin ? 'Masuk kembali untuk melanjutkan riset Anda.' : 'Buat akun Anda sekarang juga.'}
                </p>

                {error && (
                    <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                            placeholder="nama@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors mt-2"
                    >
                        {loading ? 'Memproses...' : (isLogin ? 'Login' : 'Daftar')}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-600">
                    {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        {isLogin ? 'Daftar di sini' : 'Login di sini'}
                    </button>
                </div>
            </div>
        </div>
    );
}
