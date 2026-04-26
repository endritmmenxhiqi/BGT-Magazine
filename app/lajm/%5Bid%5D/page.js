"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import NextImage from 'next/image';
import Navbar from '../../../components/Navbar';
import CommentSection from '../../../components/CommentSection';
import LikeButton from '../../../components/LikeButton';
import { ArrowLeft, Play, Share2, Bookmark, User, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        setProfile(prof);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <span className="text-4xl font-black tracking-tighter text-black uppercase animate-pulse">BGT</span>
        <div className="w-12 h-12 border-t-2 border-black rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      <article className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-64 pb-40">
        
        {/* Modern Replica Header Area */}
        <div className="flex flex-col mb-20 text-center items-center">
            <Link 
                href="/" 
                className="group flex items-center gap-3 text-[10px] font-black uppercase text-gray-400 hover:text-black tracking-[0.4em] mb-12 transition-all"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                Kthehu tek të gjitha lajmet
            </Link>

            <div className="flex items-center gap-3 mb-10">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                   {article.category || 'BRITISH GYMNASIUM'}
                </span>
            </div>

            <h1 className="serif text-5xl lg:text-7xl font-black text-black leading-[1.05] tracking-tight mb-16 max-w-5xl">
                {article.title}
            </h1>

            <div className="flex flex-col md:flex-row items-center gap-8 py-10 border-y border-gray-100 w-full max-w-4xl justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm shadow-lg border border-white/10">
                        {article.profiles?.full_name?.charAt(0) || 'B'}
                    </div>
                    <div className="flex flex-col items-start gap-1">
                       <span className="text-[11px] font-black uppercase tracking-widest text-black/40">Autori</span>
                       <span className="text-sm font-black uppercase tracking-widest text-black">{article.profiles?.full_name || 'BGT Staff'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Data</span>
                       <span className="text-[11px] font-bold uppercase tracking-widest text-black whitespace-nowrap">
                          {new Date(article.created_at).toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}
                       </span>
                    </div>
                    <div className="w-px h-8 bg-gray-100 hidden md:block"></div>
                    <div className="flex flex-col items-center md:items-start gap-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Koha</span>
                       <span className="text-[11px] font-bold uppercase tracking-widest text-black">6 MIN LEXIM</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-lg transition-all text-gray-400">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-lg transition-all text-gray-400">
                        <Bookmark className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* Hero Media Container */}
        <div className="relative mb-32 rounded-2xl overflow-hidden group shadow-2xl border border-gray-100 ring-8 ring-gray-50/50">
            {article.image_url && (
                <div className="relative aspect-video w-full">
                    <NextImage 
                        src={article.image_url} 
                        alt={article.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            )}
            
            {article.video_url && (
                <div className="p-12 lg:p-16 border-t border-gray-100 bg-gray-50 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-transform group/play">
                        <Play className="w-8 h-8 text-white fill-current group-hover/play:animate-pulse" />
                    </div>
                    <div className="flex-1 text-center lg:text-left gap-4 flex flex-col">
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                           <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded">VIDEO</span>
                           <h4 className="serif text-3xl font-black text-black tracking-tight">Kamera e Redaksisë</h4>
                        </div>
                        <p className="text-gray-400 text-lg font-medium leading-relaxed">Artikulli përmban materiale vizuale dokumentare nga terreni.</p>
                    </div>
                    <Link 
                        href={article.video_url} 
                        target="_blank" 
                        className="px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-widest btn-rounded hover:opacity-80 transition-all shadow-xl"
                    >
                        Shiko Videon
                    </Link>
                </div>
            )}
        </div>

        {/* Core Article Layout */}
        <div className="flex flex-col lg:flex-row gap-24 max-w-6xl mx-auto">
            {/* Sticky Interaction Sidebar */}
            <div className="hidden lg:flex flex-col gap-10 sticky top-72 h-fit items-center">
                <div className="flex flex-col gap-6 items-center p-3 bg-gray-50/50 rounded-full border border-gray-100">
                   <LikeButton articleId={article.id} currentUser={user} />
                   <div className="w-6 h-px bg-gray-200"></div>
                   <button className="text-gray-300 hover:text-black transition-colors p-2">
                       <MessageSquare className="w-5 h-5" />
                   </button>
                </div>
            </div>

            {/* Premium Article Prose */}
            <div className="flex-1">
                <div className="prose prose-2xl prose-slate max-w-none prose-p:leading-[1.8] prose-p:text-gray-700">
                    <p className="serif text-2xl lg:text-3xl font-medium text-black leading-relaxed whitespace-pre-wrap first-letter:text-9xl first-letter:font-black first-letter:text-black first-letter:mr-6 first-letter:float-left first-letter:uppercase first-letter:leading-none">
                        {article.content}
                    </p>
                </div>

                {/* Discussions / Footer Section */}
                <div className="mt-40 pt-20 border-t border-gray-100 flex flex-col gap-16">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-lg">
                           <MessageSquare className="w-5 h-5" />
                        </div>
                        <h3 className="serif text-4xl font-black text-black">Diskutimet</h3>
                    </div>
                    <CommentSection 
                        articleId={article.id} 
                        currentUser={user} 
                        isEditor={profile?.role === 'editor'} 
                    />
                </div>
            </div>
        </div>
      </article>

      {/* Modern Black Footer Replica */}
      <footer className="py-32 bg-black text-white border-t border-white/10 mt-20 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 flex flex-col items-center gap-16 text-center relative z-10">
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className="text-6xl font-black tracking-tighter uppercase leading-none text-white">BGT</span>
                    <span className="text-[12px] font-bold uppercase tracking-[0.4em] text-white/20 mt-1">Magazine</span>
                </div>
                <p className="text-white/30 text-[11px] font-bold uppercase tracking-[0.5em] mt-4">British Gymnasium of Technology Official Portal</p>
            </div>
            
            <div className="w-24 h-[1px] bg-white/10"></div>

            <div className="flex flex-wrap items-center justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                <Link href="/" className="hover:text-white transition-colors">Ballina</Link>
                <Link href="#" className="hover:text-white transition-colors">Politika</Link>
                <Link href="#" className="hover:text-white transition-colors">Termat</Link>
                <Link href="#" className="hover:text-white transition-colors">Kontakt</Link>
            </div>
        </div>
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden flex items-center justify-center">
            <span className="text-[30rem] font-black text-white select-none translate-y-20">BGT</span>
        </div>
      </footer>
    </main>
  );
}
