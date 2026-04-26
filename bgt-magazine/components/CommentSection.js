"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Send, Trash2, User, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function CommentSection({ articleId, currentUser, isEditor }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(full_name)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (!error) setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('comments')
      .insert([{
        article_id: articleId,
        user_id: currentUser.id,
        content: newComment.trim()
      }]);

    if (!error) {
      setNewComment('');
      fetchComments();
    }
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    if (!isEditor) return;
    
    if (confirm("A jeni i sigurt që dëshironi ta fshini këtë koment?")) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (!error) {
        fetchComments();
      }
    }
  };

  return (
    <div className="flex flex-col gap-16">
      
      {/* Form Section */}
      <div className="bg-white dark:bg-black border border-gray-100 dark:border-white/10 p-10 lg:p-14">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-[#0f172a] dark:bg-yellow-600"></div>
                <div className="flex flex-col">
                    <h4 className="serif text-3xl font-extrabold text-[#0f172a] dark:text-white leading-none">Mendimi Juaj</h4>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Nxitni Diskutimin</span>
                </div>
            </div>

            <div className="relative">
                <textarea
                  rows="4"
                  placeholder={currentUser ? "Shkruaj një koment..." : "Identifikohu për të komentuar..."}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-8 text-lg font-medium outline-none focus:border-[#0f172a] dark:focus:border-white transition-all resize-none placeholder:text-gray-300 dark:placeholder:text-white/10"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onClick={() => !currentUser && router.push('/login')}
                />
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-6 bottom-6 bg-[#0f172a] text-white dark:bg-white dark:text-[#0f172a] px-8 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-600 transition-all disabled:opacity-20"
                >
                  Dërgo Komentin
                </button>
            </div>
            
            <p className="text-[9px] font-black text-gray-300 dark:text-white/10 uppercase tracking-[0.4em] text-center italic">
                Redaksia e BGT Magazine ruan të drejtën e moderimit të gjuhës.
            </p>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-16">
        {comments.length > 0 ? comments.map(comment => (
          <div key={comment.id} className="group relative flex gap-10 pb-16 border-b border-gray-50 dark:border-white/5 last:border-none">
            
            <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center serif font-black text-[#0f172a] dark:text-white text-3xl group-hover:bg-yellow-600 group-hover:text-white transition-colors duration-500">
                  {comment.profiles?.full_name?.charAt(0) || 'U'}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="serif text-2xl font-extrabold text-[#0f172a] dark:text-white tracking-tight leading-none group-hover:text-yellow-600 transition-colors">
                        {comment.profiles?.full_name || 'Anëtar i BGT'}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">
                            {new Date(comment.created_at).toLocaleDateString('sq-AL', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
                
                {isEditor && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                    >
                      <Trash2 className="w-4 h-4" />
                      Fshij
                    </button>
                )}
              </div>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-3xl italic">
                "{comment.content}"
              </p>
            </div>
          </div>
        )) : (
          <div className="py-32 flex flex-col items-center gap-6 text-center border-2 border-dotted border-gray-100 dark:border-white/10 opacity-30 grayscale">
            <MessageSquare className="w-12 h-12 text-gray-400" />
            <h5 className="serif text-2xl font-black text-gray-400 uppercase tracking-widest">Nuk ka Diskutime Ende</h5>
          </div>
        )}
      </div>

    </div>
  );
}
