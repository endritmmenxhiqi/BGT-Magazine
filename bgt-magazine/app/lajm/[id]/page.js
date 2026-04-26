"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import NextImage from 'next/image';
import Navbar from '../../../components/Navbar';
import CommentSection from '../../../components/CommentSection';
import LikeButton from '../../../components/LikeButton';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';


export default function ArticleDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: art, error } = await supabase
        .from('articles')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single();
      
      if (error) {
        router.push('/');
        return;
      }
      setArticle(art);

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-8 h-8 border-t-2 border-black rounded-full animate-spin"></div>
        <span className="serif text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Duke hapur...</span>
      </div>
    </div>
  );

  const images = article?.image_url ? article.image_url.split(/[\n,]+/).map(s => s.trim()).filter(Boolean) : [];
  const videos = article?.video_url ? article.video_url.split(/[\n,]+/).map(s => s.trim()).filter(Boolean) : [];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <article className="pt-32 sm:pt-40 pb-24">
        
        {/* Header - Clean & Minimalist */}
        <header className="max-w-[800px] mx-auto px-6 text-center mb-16">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-300 hover:text-black tracking-widest mb-10 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Ballina
            </Link>
            
            <span className="block text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-6">
                {article.category || 'Gazetaria'}
            </span>
            
            <h1 className="serif text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] text-black mb-10 tracking-tight">
                {article.title}
            </h1>

            <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                     <span className="serif text-black font-black">{article.profiles?.full_name?.charAt(0) || 'B'}</span>
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-xs font-black uppercase tracking-wider text-black">
                        {article.profiles?.full_name || 'Redaksia'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(article.created_at).toLocaleDateString('sq-AL', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>
        </header>

        {/* Hero Image Block */}
        {images.length > 0 && (
            <div className="max-w-[1000px] mx-auto px-6 mb-20">
                <div className="relative aspect-[16/9] sm:aspect-[2/1] w-full bg-gray-50 overflow-hidden shadow-sm">
                    <NextImage 
                        src={images[0]} 
                        alt={article.title} 
                        fill 
                        className="object-cover"
                        priority
                    />
                </div>
                <p className="text-center mt-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    FOTO KRYESORE NGA NGJARJA
                </p>
            </div>
        )}

        {/* Article Body - Layout Medium Style */}
        <div className="max-w-[700px] mx-auto px-6 flex flex-col gap-8 md:gap-10">
            
            <div className="flex items-center gap-4 text-gray-400 mx-auto justify-center w-full mb-6">
                <button className="hover:text-black transition-colors p-2 flex items-center gap-2 text-xs font-bold uppercase"><Share2 className="w-4 h-4" /> Shpërndaj</button>
                <div className="w-[1px] h-4 bg-gray-200"></div>
                <div className="scale-75 origin-left"><LikeButton articleId={article.id} currentUser={user} /></div>
            </div>

            <div className="prose prose-lg sm:prose-xl max-w-none text-gray-800 leading-[1.8] font-serif">
                {article.content.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                    <p key={index} className="mb-8">{paragraph}</p>
                ))}
            </div>
        </div>

        {/* Video Block */}
        {videos.length > 0 && (
            <div className="max-w-[800px] mx-auto px-6 mt-20 mb-20">
                <div className="w-16 h-1 bg-black mb-8 mx-auto"></div>
                <h3 className="serif text-2xl font-black text-center mb-10 text-black">Videoklipi i Gazetarit</h3>
                <div className="flex flex-col gap-6">
                    {videos.map((vid, i) => (
                        <div key={i} className="relative w-full aspect-video bg-gray-100 shadow-md">
                            <video src={vid} controls className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Additional Images (Gallery) */}
        {images.length > 1 && (
            <div className="max-w-[1000px] mx-auto px-6 mt-20 mb-20">
                <div className="w-16 h-1 bg-black mb-8 mx-auto"></div>
                <h3 className="serif text-2xl font-black text-center mb-10 text-black">Galeria e Fotove</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {images.slice(1).map((img, idx) => (
                        <div key={idx} className="relative aspect-[4/3] bg-gray-50 border border-gray-100 hover:opacity-90 transition-opacity cursor-pointer">
                            <NextImage 
                                src={img} 
                                alt={`Galeria ${idx + 1}`} 
                                fill 
                                className="object-cover" 
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* End of Article Divider */}
        <div className="max-w-[700px] mx-auto px-6 mt-24 mb-16 flex items-center justify-center gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
        </div>

        {/* Author Footer Card */}
        <div className="max-w-[700px] mx-auto px-6 mb-24">
            <div className="p-8 bg-[#f8fafc] border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-20 h-20 bg-black flex items-center justify-center shrink-0 text-white font-black text-2xl serif">
                    {article.profiles?.full_name?.charAt(0) || 'B'}
                </div>
                <div className="text-center sm:text-left flex-1">
                    <span className="text-[9px] font-black text-gray-400 tracking-[0.2em] uppercase mb-1 block">RRETH AUTORIT</span>
                    <h3 className="serif text-xl font-black mb-3 text-black">{article.profiles?.full_name || 'Gazetar Akademik'}</h3>
                    <p className="text-gray-500 leading-relaxed font-medium text-sm">Pjesë e stafit dedikuar gazetarisë inovative dhe teknologjisë brenda rrjetit të BGT. Pasion për të vërtetën dhe zhvillimin social në shkollë.</p>
                </div>
            </div>
        </div>

        {/* Comments Section */}
        <div className="max-w-[700px] mx-auto px-6 pt-16 border-t border-gray-100">
            <h3 className="serif text-2xl font-black text-black mb-8">Komentet</h3>
            <CommentSection 
                articleId={article.id} 
                currentUser={user} 
                isEditor={profile?.role === 'editor'} 
            />
        </div>
      </article>

      {/* Footer Basic */}
      <footer className="py-20 bg-white border-t border-gray-100 text-center flex flex-col items-center">
        <span className="serif text-3xl font-black tracking-tighter uppercase text-black mb-4">BGT</span>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">© 2026 Redaksia BGT</p>
      </footer>
    </main>
  );
}
