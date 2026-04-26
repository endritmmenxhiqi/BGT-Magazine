"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Lock, Mail, User, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', confirm_password: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setModalMsg("Fjalëkalimet nuk përputhen!");
      setIsSuccess(false);
      setShowModal(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.full_name } }
    });

    if (error) {
      setModalMsg("Gabim gjatë regjistrimit: " + error.message);
      setIsSuccess(false);
    } else {
      setModalMsg("Llogaria u krijua me sukses! Ju lutem kontrolloni email-in tuaj.");
      setIsSuccess(true);
    }
    setShowModal(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdf7e8] transition-colors duration-500 overflow-hidden">
        <div className="w-full max-w-[500px]">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
                
                {/* Logo Branding - Compact */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="mb-4">
                        <Image src="/logo-bgt.png" alt="BGT Logo" width={60} height={60} className="object-contain" priority />
                    </div>
                    <Link href="/" className="mb-4 flex items-center gap-2">
                        <span className="serif text-2xl font-black tracking-tight text-[#1e4a6e]">BGT</span>
                        <span className="serif text-2xl font-black tracking-tight text-orange-400">Online</span>
                    </Link>
                    
                    <h1 className="serif text-2xl font-black text-[#0f172a] tracking-tight mb-1">Anëtarësimi i Ri</h1>
                    <p className="text-gray-400 text-[12px] font-medium">Krijoni llogarinë tuaj akademike</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-[#0f172a] uppercase tracking-wider ml-1">
                            Emri i Plotë
                        </label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Filan Fisteku"
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#1e4a6e] focus:bg-white text-sm transition-all placeholder:text-gray-300 font-medium" 
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-black text-[#0f172a] uppercase tracking-wider ml-1">
                            Email
                        </label>
                        <input 
                            type="email" 
                            required 
                            placeholder="emri@shembull.al"
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#1e4a6e] focus:bg-white text-sm transition-all placeholder:text-gray-300 font-medium" 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-[#0f172a] uppercase tracking-wider ml-1">
                                Fjalëkalimi
                            </label>
                            <input 
                                type="password" 
                                required 
                                placeholder="••••••••"
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#1e4a6e] focus:bg-white text-sm transition-all placeholder:text-gray-300 font-medium" 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-[#0f172a] uppercase tracking-wider ml-1">
                                Konfirmo
                            </label>
                            <input 
                                type="password" 
                                required 
                                placeholder="••••••••"
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#1e4a6e] focus:bg-white text-sm transition-all placeholder:text-gray-300 font-medium" 
                                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})} 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-[#13637a] text-white font-black py-4 rounded-xl hover:bg-[#0f4e61] transition-all active:scale-[0.98] disabled:opacity-30 mt-2 text-xs uppercase tracking-widest shadow-lg shadow-cyan-900/10"
                    >
                        {loading ? 'Procesimi...' : 'Krijo Llogarinë'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-50 flex flex-col items-center gap-4 text-center">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        Keni një llogari?
                        <Link href="/login" className="text-[#13637a] hover:underline">Hyr Këtu</Link>
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col items-center gap-3 mt-6 opacity-40 text-center">
                <Link href="/" className="group flex items-center gap-2 text-[9px] font-black text-gray-400 hover:text-[#0f172a] transition-all uppercase tracking-widest">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Kthehu tek Ballina
                </Link>
                <p className="text-[7px] font-black text-gray-300 uppercase tracking-[0.5em]">
                    © 2026 BGT Online
                </p>
            </div>
        </div>

        {/* Success/Error Modal Modern */}
        {showModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[2rem] p-10 max-w-[400px] w-full shadow-2xl text-center border border-gray-50 animate-in fade-in zoom-in duration-200">
                    <div className={`w-20 h-20 ${isSuccess ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isSuccess ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            )}
                        </svg>
                    </div>
                    <h3 className="serif text-2xl font-black text-black mb-3">{isSuccess ? 'Sukses!' : 'Gabim'}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">{modalMsg}</p>
                    <button 
                        onClick={() => {
                            setShowModal(false);
                            if (isSuccess) window.location.href = '/login';
                        }}
                        className="w-full bg-black text-white font-black py-4 rounded-xl hover:opacity-80 transition-colors text-[10px] uppercase tracking-widest"
                    >
                        Mbyll
                    </button>
                </div>
            </div>
        )}

        <style jsx global>{`
          .serif { font-family: 'Playfair Display', serif; }
        `}</style>
    </div>
  );
}