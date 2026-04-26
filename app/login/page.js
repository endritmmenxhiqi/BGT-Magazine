"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import Link from 'next/link';


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setErrorMsg("Identifikimi dështoi: " + authError.message);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        router.push('/dashboard');
      } else {
        const userRole = profileData.role;
        if (userRole === 'editor') router.push('/editor');
        else if (userRole === 'gazetar') router.push('/jurnalist');
        else router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg("Ndodhi një gabim teknik.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdf7e8] transition-colors duration-500 overflow-hidden">
        <div className="w-full max-w-[440px]">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
                
                {/* Logo Branding - More Compact */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="mb-4">
                        <Image src="/logo-bgt.png" alt="BGT Logo" width={60} height={60} className="object-contain text-gray-800" priority />
                    </div>
                    <Link href="/" className="mb-6 flex items-center gap-2">
                        <span className="serif text-2xl font-black tracking-tight text-[#1e4a6e]">BGT</span>
                        <span className="serif text-2xl font-black tracking-tight text-orange-400">Online</span>
                    </Link>
                    
                    <h1 className="serif text-3xl font-black text-[#0f172a] tracking-tight mb-2">Mirë se vini</h1>
                    <p className="text-gray-400 text-[13px] font-medium italic">Vazhdoni me llogarinë tuaj</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-[11px] font-bold text-center rounded-lg border border-red-100">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-[#0f172a] uppercase tracking-wider ml-1">
                            Email
                        </label>
                        <input 
                            type="email" 
                            required 
                            placeholder="email@shembull.al"
                            className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#1e4a6e] focus:bg-white text-sm transition-all placeholder:text-gray-300 font-medium" 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="block text-[11px] font-black text-[#0f172a] uppercase tracking-wider">
                                Fjalëkalimi
                            </label>
                            <Link href="/forgot-password" title="Rivendos fjalëkalimin" className="text-[10px] text-[#1e4a6e] hover:underline font-bold transition-colors">
                                Keni harruar?
                            </Link>
                        </div>
                        <input 
                            type="password" 
                            required 
                            placeholder="••••••••"
                            className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#1e4a6e] focus:bg-white text-sm transition-all placeholder:text-gray-300 font-medium" 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-[#13637a] text-white font-black py-4 rounded-xl hover:bg-[#0f4e61] transition-all active:scale-[0.98] disabled:opacity-30 mt-2 text-xs uppercase tracking-widest shadow-lg shadow-cyan-900/10"
                    >
                        {loading ? 'Hyrja...' : 'Hyr Tani'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center gap-4 text-center">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        Nuk keni llogari?
                        <Link href="/register" className="text-[#13637a] hover:underline">Regjistrohu</Link>
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 mt-8 opacity-40">
                <Link href="/" className="group flex items-center gap-2 text-[9px] font-black text-gray-400 hover:text-[#0f172a] transition-all uppercase tracking-widest">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Ballina
                </Link>
                <p className="text-[7px] font-black text-gray-300 uppercase tracking-[0.5em]">
                    © 2026 BGT Online
                </p>
            </div>
        </div>

        <style jsx global>{`
          .serif { font-family: 'Playfair Display', serif; }
        `}</style>
    </div>
  );
}
