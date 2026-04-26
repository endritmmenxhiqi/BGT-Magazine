"use client";
import React, { useEffect, useState, useMemo } from 'react';
import NextImage from 'next/image';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import HeroNews from '../components/HeroNews';
import NewsCard from '../components/NewsCard';
import { ChevronRight, Play, Mic, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';


export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const itemsPerPage = 6;

  const activeFilter = categoryParam || 'Të gjitha';
  const filters = ['Të gjitha', 'Lajme', 'Sukseset', 'Inovacioni', 'Sporti', 'Projektet', 'Klubet'];

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles(full_name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error) setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (searchTerm) {
      result = result.filter(art => 
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeFilter !== 'Të gjitha') {
      result = result.filter(art => art.category?.toLowerCase() === activeFilter.toLowerCase());
    }
    return result;
  }, [articles, searchTerm, activeFilter]);

  // Pagination Logic
  const displayPool = (!searchTerm && activeFilter === 'Të gjitha') ? articles.slice(5) : filteredArticles;
  const totalPages = Math.ceil(displayPool.length / itemsPerPage);
  const paginatedArticles = displayPool.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white transition-colors duration-700">
      <div className="flex flex-col items-center gap-4">
        <span className="text-4xl font-black tracking-tighter text-black uppercase animate-pulse">BGT</span>
        <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-black w-1/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );

  return (
    <main className="min-h-screen transition-colors duration-500 overflow-x-hidden">
      <Navbar onSearch={setSearchTerm} />

      {/* Replica Hero Grid Section */}
      {!searchTerm && activeFilter === 'Të gjitha' && articles.length > 0 && (
        <HeroNews articles={articles.slice(0, 5)} />
      )}

      {/* Main Content Layout (Grid + Sidebar) */}
      <section className="max-w-[1400px] mx-auto px-6 py-20 pb-40 text-black">
        
        {/* Latest News Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-gray-100 pb-6 gap-6">
          <h2 className="serif text-3xl font-black text-black tracking-tight">Më të rejat</h2>
          
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth">
             {filters.map(filter => (
               <Link 
                key={filter} 
                href={filter === 'Të gjitha' ? '/' : `/?category=${filter}`}
                onClick={() => setCurrentPage(1)}
                className={`text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-all px-4 py-2 rounded-full ${activeFilter === filter ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
               >
                 {filter}
               </Link>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Content Feed (Left 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
             {displayPool.length === 0 ? (
               /* Show "Zero Results" only if we are searching or filtering */
               (searchTerm || activeFilter !== 'Të gjitha') ? (
                 <div className="py-20 text-center flex flex-col items-center gap-6 opacity-30">
                    <span className="serif text-2xl font-bold uppercase tracking-widest text-black">Zero Rezultate</span>
                    <button onClick={() => { setSearchTerm(''); setActiveFilter('Të gjitha'); setCurrentPage(1); }} className="text-[12px] font-black underline uppercase tracking-widest text-black">Shko tek lajmet kryesore</button>
                 </div>
               ) : null
             ) : (
               <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-8 min-h-[600px]">
                    {paginatedArticles.map(art => (
                      <NewsCard key={art.id} article={art} />
                    ))}
                  </div>

                  {/* Enhanced Pagination UI */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-20 pt-10 border-t border-gray-100">
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 800, behavior: 'smooth' }); }}
                          className="px-10 py-4 bg-white border border-gray-100 text-black text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-20 hover:bg-gray-50 transition-all rounded-xl shadow-sm"
                        >
                           PRAPA
                        </button>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Faqja</span>
                           <span className="text-sm font-black text-black">{currentPage} / {totalPages}</span>
                        </div>
                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 800, behavior: 'smooth' }); }}
                          className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-20 hover:opacity-80 transition-all rounded-xl shadow-lg"
                        >
                           PARA
                        </button>
                    </div>
                  )}
               </div>
             )}
          </div>

          {/* Sidebar Section (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-16">
             
             {/* 1. Më të Komentuarat */}
             <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b border-black pb-4">
                    <h3 className="serif text-sm font-black text-black uppercase tracking-widest">Më të komentuarat</h3>
                    <TrendingUp className="w-4 h-4 text-black opacity-30" />
                </div>
                <div className="flex flex-col gap-10">
                   {[...articles.slice(0, 3)].map((art, idx) => (
                      <Link key={art.id} href={`/lajm/${art.id}`} className="group flex gap-6 items-start">
                         <span className="text-4xl font-black text-gray-100 group-hover:text-black transition-colors">{idx + 1}</span>
                         <h4 className="serif text-sm font-black text-black leading-tight line-clamp-3 group-hover:text-gray-600 transition-colors uppercase tracking-tight">
                            {art.title}
                         </h4>
                      </Link>
                   ))}
                </div>
             </div>

             {/* 3. Small Video Section */}
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="serif text-sm font-black text-black uppercase tracking-widest">Video</h3>
                    <Play className="w-4 h-4 text-black opacity-30" />
                </div>
                <div className="aspect-video relative rounded-lg overflow-hidden group shadow-md cursor-pointer">
                   <NextImage src={articles[0]?.image_url?.split(/[\n,]+/)[0].trim() || '/logo-bgt.png'} alt="Video Preview" fill className="object-cover group-hover:scale-105 transition-transform" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white fill-current" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Multi-tier Footer */}
      <footer className="bg-black text-white py-24 mt-20 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
            <div className="flex flex-col items-center lg:items-start gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-5xl font-black tracking-tighter uppercase leading-none text-white">BGT</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mt-1">Magazine</span>
                </div>
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">British Gymnasium of Technology Online Portal</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-10 text-[11px] font-black uppercase tracking-[0.4em] text-white/40">
                <Link href="#" className="hover:text-white transition-colors">Politika</Link>
                <Link href="#" className="hover:text-white transition-colors">Termat</Link>
                <Link href="#" className="hover:text-white transition-colors">Hyrja</Link>
                <Link href="#" className="hover:text-white transition-colors text-white py-4 px-10 border border-white/20 rounded-full">BGT Web</Link>
            </div>
        </div>
      </footer>
    </main>
  );
}