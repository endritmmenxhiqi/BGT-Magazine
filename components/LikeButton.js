"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function LikeButton({ articleId, currentUser }) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLikes = async () => {
    const { data: likes, error: countError } = await supabase
      .from('likes')
      .select('article_id', { count: 'exact' })
      .eq('article_id', articleId);
    
    if (!countError) setLikesCount(likes.length);

    if (currentUser) {
      const { data: userLike } = await supabase
        .from('likes')
        .select('*')
        .eq('article_id', articleId)
        .eq('user_id', currentUser.id)
        .single();
      
      setIsLiked(!!userLike);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLikes();
  }, [articleId, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', currentUser.id);

      if (!error) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert([{ article_id: articleId, user_id: currentUser.id }]);

      if (!error) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    }
  };

  return (
    <button 
      onClick={handleLike}
      disabled={loading}
      className={`group flex items-center gap-4 px-8 py-5 border transition-all duration-300 active:scale-95 ${
        isLiked 
        ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-lg' 
        : 'bg-white dark:bg-black border-gray-100 dark:border-white/10 text-gray-400 hover:text-[#0f172a] dark:hover:text-white hover:border-[#0f172a] dark:hover:border-white'
      }`}
    >
      <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      <div className="flex flex-col items-start leading-none gap-0.5">
        <span className="text-sm font-black uppercase tracking-widest">{likesCount}</span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Reagime</span>
      </div>
    </button>
  );
}
