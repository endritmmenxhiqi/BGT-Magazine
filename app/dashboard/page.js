"use client";
import React, { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import NewsCard from '../../components/NewsCard';
import { Settings, LogOut, ChevronRight, Bookmark, Newspaper, LayoutGrid, User, ShieldCheck } from 'lucide-react';


export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      setProfile(prof);

      const { data: arts } = await supabase
        .from('articles')
        .select('*, profiles(full_name)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      setArticles(arts);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleFileUpload = async (e, type, isEditing = false) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const filePath = `${type}/${Math.random()}.${file.name.split('.').pop()}`;
      let { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      
      if (isEditing) {
        const currentUrl = type === 'images' ? (editingArticle.image_url || '') : (editingArticle.video_url || '');
        if (type === 'images') {
            setEditingArticle({ ...editingArticle, image_url: currentUrl ? `${currentUrl}, ${data.publicUrl}` : data.publicUrl });
        } else {
            setEditingArticle({ ...editingArticle, video_url: currentUrl ? `${currentUrl}, ${data.publicUrl}` : data.publicUrl });
        }
      } else {
        const el = document.getElementsByName(type === 'images' ? 'image_url' : 'video_url')[0];
        if (el) el.value = el.value ? `${el.value}, ${data.publicUrl}` : data.publicUrl;
      }
      alert("Media u ngarkua!");
    } catch (error) { alert("Gabim gjatë ngarkimit!"); } finally { setUploading(false); }
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    setUploading(true);
    const { error } = await supabase
      .from('articles')
      .update({
        title: editingArticle.title,
        content: editingArticle.content,
        image_url: editingArticle.image_url,
        video_url: editingArticle.video_url,
        category: editingArticle.category
      })
      .eq('id', editingArticle.id);

    if (!error) {
      alert("Lajmi u përditësua!");
      setEditingArticle(null);
      window.location.reload();
    } else {
      alert("Gabim: " + error.message);
    }
    setUploading(false);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <span className="text-4xl font-black tracking-tighter text-black uppercase animate-pulse">BGT</span>
        <div className="w-12 h-12 border-t-2 border-black rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50/30 transition-colors duration-500 overflow-x-hidden">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-32 sm:py-40 lg:py-56">
        
        <section className="mb-12 sm:mb-20 bg-white p-6 sm:p-12 rounded-xl border border-gray-100 shadow-sm transition-all duration-300">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 text-center lg:text-left">
                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-black text-white flex items-center justify-center rounded-2xl text-4xl font-black shadow-xl ring-8 ring-gray-50 border border-white/10 shrink-0">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-100">
                           <ShieldCheck className="w-5 h-5 text-gray-800" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">STATUSI: AKTIV</span>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <h1 className="serif text-4xl sm:text-5xl lg:text-7xl font-black text-black tracking-tight leading-none mb-3 sm:mb-4">
                            {profile?.full_name?.split(' ')[0] || 'Anëtar'} <span className="opacity-10 hidden xs:inline">/ BGT</span>
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[11px] leading-relaxed break-all sm:break-normal">
                            {user?.email} • Gazetaria Akademike
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <button className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 shadow-sm transition-all flex items-center justify-center gap-3">
                        <Settings className="w-4 h-4" /> CILËSIMET
                    </button>
                    <button 
                        onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
                        className="w-full sm:w-auto px-8 py-4 bg-black text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl hover:opacity-80 shadow-lg transition-all flex items-center justify-center gap-3"
                    >
                        <LogOut className="w-4 h-4" /> DIL
                    </button>
                </div>
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col gap-8 lg:gap-12">
                
                {(profile?.role === 'editor' || profile?.role === 'admin') && (
                    <section className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-8 border-b border-gray-50 pb-6">
                            <div className="p-3 bg-gray-50 rounded-lg text-black">
                               <Newspaper className="w-5 h-5" />
                            </div>
                            <h2 className="serif text-xl sm:text-2xl font-black text-black tracking-tight">KRIJO LAJM</h2>
                        </div>
                        
                        <form className="flex flex-col gap-6 sm:gap-8" onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const title = formData.get('title');
                            const content = formData.get('content');
                            const category = formData.get('category');
                            const image_url = formData.get('image_url');
                            const video_url = formData.get('video_url');

                            if (!title || !content || !category) {
                                alert("Plotësoni të dhënat kryesore!");
                                return;
                            }

                            const { error } = await supabase.from('articles').insert([{
                                title, content, category, image_url, video_url,
                                author_id: user.id,
                                status: 'published',
                                created_at: new Date()
                            }]);

                            if (error) alert("Gabim: " + error.message);
                            else window.location.reload();
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Titulli</label>
                                    <input name="title" type="text" placeholder="Titulli..." className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-6 text-sm outline-none focus:border-black transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Kategoria</label>
                                    <select name="category" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-6 text-sm outline-none focus:border-black transition-all cursor-pointer">
                                        <option value="Lajme">Lajme</option>
                                        <option value="Sukseset">Sukseset</option>
                                        <option value="Inovacioni">Inovacioni</option>
                                        <option value="Sporti">Sporti</option>
                                        <option value="Projektet">Projektet</option>
                                        <option value="Klubet">Klubet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Përmbajtja</label>
                                <textarea name="content" rows="5" placeholder="Shkruaj lajmin këtu..." className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-sm outline-none focus:border-black transition-all resize-none"></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Foto (Linqe ose File)</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'images')} className="text-[10px] text-gray-400" />
                                    <textarea name="image_url" rows="2" placeholder="https://..., https://..." className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-6 text-sm outline-none focus:border-black transition-all resize-none"></textarea>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Video (Opsionale, me presje)</label>
                                    <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'videos')} className="text-[10px] text-gray-400" />
                                    <textarea name="video_url" rows="2" placeholder="https://youtube.com/..., https://vimeo.com/..." className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-6 text-sm outline-none focus:border-black transition-all resize-none"></textarea>
                                </div>
                            </div>

                            <button type="submit" disabled={uploading} className="w-full bg-[#13637a] text-white py-5 rounded-xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#0f4e61] transition-all shadow-xl shadow-cyan-900/10 disabled:opacity-50">
                                {uploading ? 'DUKE NGARKUAR...' : 'Publiko Tani'}
                            </button>
                        </form>
                    </section>
                )}

                <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-4">
                    <div className="flex items-center gap-4">
                       <LayoutGrid className="w-5 h-5 text-black" />
                       <h2 className="serif text-xl sm:text-2xl font-black text-black uppercase tracking-tight">Arkiva Juaj</h2>
                    </div>
                </div>

                {articles.length > 0 ? (
                    <div className="flex flex-col gap-6 sm:gap-8">
                        {articles.slice(0, 10).map(art => (
                            <div key={art.id} className="relative group">
                                <NewsCard article={art} />
                                <button 
                                    onClick={() => setEditingArticle(art)}
                                    className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white"
                                >
                                    EDITO
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 sm:py-40 flex flex-col items-center gap-6 text-center border-2 border-dashed border-gray-100 rounded-2xl opacity-40">
                        <User className="w-10 h-10" />
                        <h5 className="serif text-lg font-bold uppercase tracking-widest italic">Nuk ka publikime</h5>
                    </div>
                )}
            </div>

            <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-6 sm:gap-8">
                <div className="bg-white p-8 sm:p-10 rounded-xl border border-gray-100 shadow-sm group cursor-pointer hover:border-[#13637a] transition-all">
                    <div className="flex items-center justify-between mb-8 sm:mb-10">
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-[#13637a] group-hover:text-white transition-all text-gray-400">
                           <Newspaper className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-[#13637a] group-hover:translate-x-2 transition-all" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Biblioteka</span>
                    <h3 className="serif text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">Artikujt e Publikuar</h3>
                </div>

                <div className="bg-[#f0f9fb] p-8 sm:p-10 rounded-xl border border-blue-50/50 shadow-sm group">
                    <div className="flex items-center justify-between mb-8 sm:mb-10">
                        <div className="p-3 bg-white rounded-lg text-[#13637a]">
                           <Bookmark className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black text-[#13637a]/40 uppercase tracking-widest italic">AKTIV</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-[#13637a]/60 uppercase tracking-widest mb-3 block">Roli Juaj</span>
                    <h3 className="serif text-3xl sm:text-4xl font-black text-[#0f172a] capitalize">{profile?.role || 'Studente'}</h3>
                </div>
            </div>
        </div>
      </div>

      {editingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-10 relative">
                <button onClick={() => setEditingArticle(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 font-black hover:bg-gray-100 transition-all">✕</button>
                <h3 className="serif text-2xl sm:text-3xl font-black mb-8 text-black border-b border-gray-50 pb-6 uppercase tracking-tighter">Edito Publikimin</h3>
                
                <form onSubmit={handleUpdateArticle} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Titulli</label>
                            <input required type="text" value={editingArticle.title} onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-sm focus:border-black" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Kategoria</label>
                            <select value={editingArticle.category} onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold text-sm cursor-pointer">
                                <option value="Lajme">Lajme</option>
                                <option value="Sukseset">Sukseset</option>
                                <option value="Inovacioni">Inovacioni</option>
                                <option value="Sporti">Sporti</option>
                                <option value="Projektet">Projektet</option>
                                <option value="Klubet">Klubet</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Update Foto (File ose Linqe)</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'images', true)} className="text-[10px] text-gray-400" />
                            <textarea value={editingArticle.image_url} onChange={(e) => setEditingArticle({...editingArticle, image_url: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-xs font-bold min-h-[80px] resize-none" placeholder="Linqet e fotove..."></textarea>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Update Video (File ose Linqe)</label>
                            <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'videos', true)} className="text-[10px] text-gray-400" />
                            <textarea value={editingArticle.video_url} onChange={(e) => setEditingArticle({...editingArticle, video_url: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-xs font-bold min-h-[80px] resize-none" placeholder="Linqet e videove..."></textarea>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Përmbajtja</label>
                        <textarea required rows="8" value={editingArticle.content} onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})} className="w-full p-5 bg-gray-50 rounded-3xl border border-gray-100 outline-none text-sm leading-relaxed focus:border-black"></textarea>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={uploading} className="flex-1 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:opacity-90 disabled:opacity-50 shadow-xl transition-all">
                            {uploading ? 'DUKE RUAJTUR...' : 'RUAJ NDRYSHIMET'}
                        </button>
                        <button type="button" onClick={() => setEditingArticle(null)} className="px-10 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-200 transition-all">Anulo</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <footer className="py-24 bg-black text-white text-center flex flex-col items-center gap-10 border-t border-white/10 mt-20">
          <div className="flex items-center gap-4">
              <span className="text-4xl font-black tracking-tighter uppercase leading-none text-white">BGT</span>
              <div className="w-px h-8 bg-white/20"></div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Dashboard i Personalizuar</p>
          </div>
          <div className="flex gap-10 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
             <Link href="/" className="hover:text-white transition-colors">Kthehu te Ballina</Link>
             <span className="opacity-20">/</span>
             <Link href="#" className="hover:text-white transition-colors">Gjuhët: SQ | EN</Link>
          </div>
      </footer>
    </main>
  );
}