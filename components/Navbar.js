"use client";
import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, Sun, ChevronDown, Menu, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function Navbar({ onSearch }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { name: 'KREU', slug: '/' },
    { name: 'LAJME', slug: '/?category=Lajme' },
    { name: 'SUKSESET', slug: '/?category=Sukseset' },
    { name: 'INOVACIONI', slug: '/?category=Inovacioni' },
    { name: 'SPORTI', slug: '/?category=Sport' },
    { name: 'PROJEKTET', slug: '/?category=Projektet' },
    { name: 'KLUBET', slug: '/?category=Klubet' },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        setProfile(data);
      }
    };
    getUser();

    // Set Date like in the image
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    setCurrentDate(now.toLocaleDateString('sq-AL', options));
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100 transition-all duration-300">
      
      {/* Tier 1: Social & Meta (Black Bar) - Hidden on Mobile */}
      <div className="hidden md:block bg-black text-white py-2 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
           <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-gray-400 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </Link>
              <Link href="#" className="hover:text-gray-400 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </Link>
           </div>
           <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider">
              <span>{currentDate}</span>
           </div>
        </div>
      </div>

      {/* Tier 2: Branding & Mobile Controls */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
         {/* Logo Section */}
         <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl font-black tracking-tighter text-black uppercase leading-none">BGT</span>
            <span className="hidden xs:block text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-1">Magazine</span>
         </Link>

         {/* Search Section - Hidden on Mobile, moved to Menu */}
         <div className="hidden lg:flex flex-1 max-w-xl mx-20">
            <div className="relative group w-full">
               <input 
                 type="text" 
                 placeholder="Kërko lajme, kategori, tema..." 
                 className="w-full bg-white border border-gray-200 rounded-lg py-3 px-6 pl-6 pr-12 text-sm outline-none focus:border-black transition-all placeholder:text-gray-300"
                 onChange={(e) => onSearch && onSearch(e.target.value)}
               />
               <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            </div>
         </div>

         {/* Right Controls */}
         <div className="flex items-center gap-3 md:gap-4">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
               {user ? (
                  <Link href="/dashboard" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-md hover:scale-105 transition-transform">
                     {profile?.full_name?.charAt(0) || 'U'}
                  </Link>
               ) : (
                  <>
                     <Link href="/login" className="px-6 py-2.5 bg-white border border-gray-200 text-black text-[12px] font-bold rounded-lg hover:bg-gray-50 transition-all">Kyçu</Link>
                     <Link href="/register" className="px-6 py-2.5 bg-black text-white text-[12px] font-bold rounded-lg hover:opacity-80 transition-all shadow-lg shadow-black/5">Regjistrohu</Link>
                  </>
               )}
            </div>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 bg-black text-white rounded-lg shadow-xl shadow-black/10 active:scale-90 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* Tier 3: Category Nav Bar - Hidden on Mobile */}
      <div className="hidden lg:block border-t border-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-between">
           <nav className="flex items-center gap-10">
              {categories.map((cat, idx) => (
                <Link 
                  key={cat.name} 
                  href={cat.slug} 
                  className={`text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 h-12 flex items-center hover:border-black ${idx === 0 ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                >
                  {cat.name}
                </Link>
              ))}
           </nav>
        </div>
      </div>

      {/* Hamburger Drawer - Mobile Only */}
      <div className={`fixed inset-0 z-[200] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* Menu Panel */}
          <div className={`absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-[#fdf7e8] shadow-2xl transition-transform duration-500 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                  <span className="serif text-xl font-black text-black uppercase tracking-tighter">BGT Navigimi</span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <ChevronDown className="w-6 h-6 rotate-90" />
                  </button>
              </div>

              {/* Mobile Search */}
              <div className="p-6 bg-white/50 border-b border-gray-100">
                  <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Kërko lajme..." 
                        className="w-full bg-white border border-gray-100 py-3.5 px-5 rounded-xl text-sm outline-none shadow-sm focus:border-black"
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                      />
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
              </div>

              {/* Categories */}
              <div className="flex-1 overflow-y-auto py-6 px-4">
                  <nav className="flex flex-col gap-2">
                      {categories.map((cat) => (
                          <Link 
                            key={cat.name} 
                            href={cat.slug} 
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-between px-6 py-4 bg-white/30 hover:bg-white rounded-xl transition-all group"
                          >
                              <span className="serif text-lg font-bold text-[#0f172a] group-hover:translate-x-1 transition-transform uppercase">{cat.name}</span>
                              <ChevronRight className="w-4 h-4 text-gray-300" />
                          </Link>
                      ))}
                  </nav>
              </div>

              {/* Mobile Auth Bottom Bar */}
              <div className="p-6 bg-white border-t border-gray-100 mt-auto">
                  {user ? (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center gap-4 p-4 bg-black text-white rounded-2xl shadow-xl active:scale-[0.98] transition-all"
                      >
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">{profile?.full_name?.charAt(0) || 'U'}</div>
                          <div className="flex flex-col text-left">
                              <span className="text-xs font-black uppercase tracking-widest leading-none mb-1">Mënyra Editoriale</span>
                              <span className="text-[10px] opacity-40 font-bold">{user.email}</span>
                          </div>
                      </Link>
                  ) : (
                      <div className="grid grid-cols-2 gap-3">
                          <Link 
                            href="/login" 
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-white border border-gray-100 text-black py-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-center active:scale-95 transition-all"
                          >
                             Kyçu
                          </Link>
                          <Link 
                            href="/register" 
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-black text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-widest text-center shadow-lg active:scale-95 transition-all"
                          >
                             Regjistrohu
                          </Link>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </header>
  );
}
