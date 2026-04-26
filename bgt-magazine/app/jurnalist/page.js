"use client";
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function GazetarDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); 
  const [myArticles, setMyArticles] = useState([]); 
  const [archive, setArchive] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 
  const [filters, setFilters] = useState({ title: '', date: '' });

  const [editingArticle, setEditingArticle] = useState(null);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', image_url: '', video_url: '', category: 'Lajme' });
  const [uploading, setUploading] = useState(false);

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: mine } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      const { data: allArchive } = await supabase
        .from('articles')
        .select('*, profiles(full_name)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (mine) setMyArticles(mine);
      if (allArchive) setArchive(allArchive);
    } catch (err) {
      showToast("Gabim në marrjen e të dhënave", "error");
    }
    setLoading(false);
  };

  useEffect(() => { 
    setMounted(true);
    fetchData(); 
  }, []);

  useEffect(() => { setCurrentPage(1); }, [activeTab, filters]);

  const filteredData = useMemo(() => {
    const baseList = activeTab === 'my_articles' ? myArticles : archive;
    return baseList.filter(art => {
      const matchesTitle = art.title.toLowerCase().includes(filters.title.toLowerCase());
      const matchesDate = filters.date ? art.created_at.startsWith(filters.date) : true;
      return matchesTitle && matchesDate;
    });
  }, [activeTab, myArticles, archive, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFileUpload = async (e, type, isEditing = false) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const filePath = `${type}/${Math.random()}.${file.name.split('.').pop()}`;
      let { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      
      if (isEditing) {
        const currentUrl = editingArticle.image_url || '';
        setEditingArticle({ ...editingArticle, image_url: currentUrl ? `${currentUrl}, ${data.publicUrl}` : data.publicUrl });
      } else {
        const currentUrl = newArticle[type === 'images' ? 'image_url' : 'video_url'] || '';
        setNewArticle({ 
          ...newArticle, 
          [type === 'images' ? 'image_url' : 'video_url']: currentUrl ? `${currentUrl}, ${data.publicUrl}` : data.publicUrl 
        });
      }
      showToast("Media u ngarkua!");
    } catch (error) { showToast("Gabim gjatë ngarkimit!", "error"); } finally { setUploading(false); }
  };

  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Combine file uploads with manual URL inputs if needed, though here we use state
    const { error } = await supabase.from('articles').insert([{ 
      ...newArticle, 
      author_id: user.id, 
      status: 'pending' 
    }]);

    if (!error) {
      showToast("Lajmi u dërgua për miratim!");
      setNewArticle({ title: '', content: '', image_url: '', video_url: '', category: 'Lajme' });
      fetchData();
      setActiveTab('my_articles');
    } else {
      console.error(error);
      if (error.code === '42703' || error.message.includes('column "category" does not exist')) {
        showToast("Mungon kolona 'category' në Supabase. Kontrolloni SQL Editor!", "error");
      } else {
        showToast("Gabim: " + error.message, "error");
      }
    }
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
      showToast("Lajmi u përditësua me sukses!");
      setEditingArticle(null);
      fetchData();
    } else {
      showToast("Gabim gjatë përditësimit: " + error.message, "error");
    }
    setUploading(false);
  };

  const PaginationControls = () => (
    totalPages > 1 && (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-xs font-bold disabled:opacity-30">Para</button>
        <span className="text-xs font-black text-[#1a5f7a] dark:text-[#38bdf8]">Faqja {currentPage} / {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-xs font-bold disabled:opacity-30">Pas</button>
      </div>
    )
  );

  if (!mounted) return null;
  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#1a5f7a] animate-pulse">Duke hapur Panelin e Gazetarit...</div>;

  return (
    <div className="flex min-h-screen font-sans bg-[#f8fafc] dark:bg-slate-950">
      
      {/* SIDEBAR (Kthyer në madhësinë e plotë 72/288px) */}
      <div className="w-72 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col p-6 sticky top-0 h-screen shadow-sm transition-all">
        <div className="mb-10 flex items-center gap-4 px-2">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image src="/logo-bgt.png" alt="Logo" fill sizes="48px" className="object-contain" priority />
          </div>
          <h1 className="text-xl font-black text-[#1a5f7a] dark:text-[#38bdf8]">BGT Gazetar</h1>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <button onClick={() => setActiveTab('create')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'create' ? 'bg-[#f59e0b] text-white shadow-lg' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            <span>✍️</span> Shkruaj Lajm
          </button>
          <button onClick={() => setActiveTab('my_articles')} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'my_articles' ? 'bg-[#1a5f7a] text-white shadow-xl' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            Lajmet e Mia <span className="px-2 py-0.5 rounded-lg text-[10px] bg-white/20">{myArticles.length}</span>
          </button>
          <button onClick={() => setActiveTab('archive')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'archive' ? 'bg-[#1a5f7a] text-white shadow-xl' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            <span>🌍</span> Arkiva Publike
          </button>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="mt-auto p-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">🚪 Dalje</button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        {/* FILTRAT */}
        {(activeTab === 'my_articles' || activeTab === 'archive') && (
          <div className="max-w-6xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <input type="text" placeholder="Filtro sipas titullit..." value={filters.title} onChange={(e) => setFilters({...filters, title: e.target.value})} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none dark:text-slate-200 border border-transparent focus:border-[#1a5f7a]" />
            <input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none dark:text-slate-200 border border-transparent focus:border-[#1a5f7a]" />
          </div>
        )}

        {/* CONTENT SECTIONS */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black mb-6 text-[#1e293b] dark:text-slate-200">Shkruaj një Lajm të Ri</h2>
            <form onSubmit={handleSubmitArticle} className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-[30px] shadow-sm border border-gray-50 dark:border-slate-800">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Kategoria</label>
                  <select 
                    value={newArticle.category} 
                    onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-slate-200 cursor-pointer border border-transparent focus:border-[#f59e0b] appearance-none"
                  >
                    <option value="Lajme">Lajme</option>
                    <option value="Sukseset">Sukseset</option>
                    <option value="Inovacioni">Inovacioni</option>
                    <option value="Sporti">Sporti</option>
                    <option value="Projektet">Projektet</option>
                    <option value="Klubet">Klubet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Titulli</label>
                  <input required type="text" value={newArticle.title} onChange={(e) => setNewArticle({...newArticle, title: e.target.value})} className="w-full p-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-md dark:text-slate-200 border border-transparent focus:border-[#1a5f7a]" placeholder="Titulli i artikullit..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Foto (Linqe ose File)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'images')} className="text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-orange-50 file:text-[#f59e0b] hover:file:bg-orange-100 transition-all" />
                  <textarea value={newArticle.image_url} onChange={(e) => setNewArticle({...newArticle, image_url: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none text-[11px] font-bold text-gray-500 min-h-[60px] resize-none" placeholder="Ngjitni linqet e fotove këtu (ndajini me presje)..."></textarea>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Video (Linqe ose File)</label>
                  <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'videos')} className="text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-[#1a5f7a] hover:file:bg-blue-100 transition-all" />
                  <textarea value={newArticle.video_url} onChange={(e) => setNewArticle({...newArticle, video_url: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none text-[11px] font-bold text-gray-500 min-h-[60px] resize-none" placeholder="Ngjitni linqet e videove këtu (ndajini me presje)..."></textarea>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Përmbajtja</label>
                <textarea required rows="8" value={newArticle.content} onChange={(e) => setNewArticle({...newArticle, content: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-[25px] outline-none text-md dark:text-slate-300 border border-transparent focus:border-[#1a5f7a]" placeholder="Shkruaj tekstin e lajmit këtu..."></textarea>
              </div>

              <button type="submit" disabled={uploading} className="w-full py-5 bg-[#f59e0b] text-white rounded-2xl font-black shadow-xl shadow-orange-200 dark:shadow-none disabled:opacity-50 text-sm uppercase tracking-widest active:scale-[0.98] transition-all">
                {uploading ? 'DUKE NGARKUAR MEDIAN...' : 'DËRGO LAJMIN PËR MIRATIM'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'my_articles' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black mb-6 text-[#1e293b] dark:text-slate-200">Historiku i Lajmeve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedData.map(art => (
                <div key={art.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col group hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${art.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'}`}>{art.status}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">{art.category || 'Lajme'}</span>
                    </div>
                    <button onClick={() => setEditingArticle(art)} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all">Edito</button>
                  </div>
                  <h3 className="font-bold text-[#1a5f7a] dark:text-[#38bdf8] text-sm mb-1.5 line-clamp-2 h-10">{art.title}</h3>
                  {art.image_url && <div className="mt-auto relative w-full h-28 rounded-xl overflow-hidden mb-1.5 shadow-sm border dark:border-slate-800"><Image src={art.image_url.split(/[\n,]+/)[0].trim()} alt="Media" fill className="object-cover" /></div>}
                  <p className="text-gray-400 text-[10px] font-bold">Data: {new Date(art.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            <PaginationControls />
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black mb-6 text-[#1e293b] dark:text-slate-200">Arkiva Publike</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {paginatedData.map(art => (
                  <div key={art.id} onClick={() => setSelectedArticle(art)} className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedArticle?.id === art.id ? 'bg-white dark:bg-slate-900 border-[#1a5f7a] shadow-lg' : 'bg-white dark:bg-slate-900 border-transparent shadow-sm'}`}>
                    <h3 className="font-bold text-xs mb-1 text-[#1e293b] dark:text-slate-200 line-clamp-2">{art.title}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase">Nga: {art.profiles?.full_name}</p>
                  </div>
                ))}
                <PaginationControls />
              </div>
              <div className="lg:col-span-2">
                {selectedArticle ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[30px] shadow-sm border border-gray-100 dark:border-slate-800">
                    {selectedArticle.image_url && <div className="relative w-full h-56 mb-5 rounded-2xl overflow-hidden shadow-md"><Image src={selectedArticle.image_url} alt="Cover" fill className="object-cover" /></div>}
                    <h1 className="text-2xl font-black mb-5 text-[#1a5f7a] leading-tight">{selectedArticle.title}</h1>
                    <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedArticle.content}</p>
                  </div>
                ) : <div className="text-center py-20 text-gray-300 font-black border-4 border-dashed rounded-[30px] uppercase text-sm">ZGJIDH NJË LAJM</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#f8fafc] dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 border border-white dark:border-slate-800 relative slide-in-from-bottom-10 animate-in duration-500">
                <button onClick={() => setEditingArticle(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 font-bold hover:rotate-90 transition-all">✕</button>
                <h3 className="serif text-2xl font-black mb-8 text-[#1a5f7a]">Edito Lajmin</h3>
                
                <form onSubmit={handleUpdateArticle} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Titulli</label>
                            <input required type="text" value={editingArticle.title} onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 outline-none font-bold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Kategoria</label>
                            <select value={editingArticle.category} onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 outline-none font-bold">
                                <option value="Lajme">Lajme</option>
                                <option value="Sukseset">Sukseset</option>
                                <option value="Inovacioni">Inovacioni</option>
                                <option value="Sporti">Sporti</option>
                                <option value="Projektet">Projektet</option>
                                <option value="Klubet">Klubet</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Update Foto (Linqe ose File)</label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'images', true)} className="text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-orange-50 file:text-[#f59e0b]" />
                            <textarea value={editingArticle.image_url} onChange={(e) => setEditingArticle({...editingArticle, image_url: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 outline-none text-xs font-bold min-h-[100px]" placeholder="Linqet e fotove..."></textarea>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Update Video (Linqe ose File)</label>
                            <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'videos', true)} className="text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-[#1a5f7a]" />
                            <textarea value={editingArticle.video_url} onChange={(e) => setEditingArticle({...editingArticle, video_url: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 outline-none text-xs font-bold min-h-[100px]" placeholder="Linqet e videove..."></textarea>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-widest">Përmbajtja</label>
                        <textarea required rows="10" value={editingArticle.content} onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-100 dark:border-slate-700 outline-none text-md leading-relaxed"></textarea>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={uploading} className="flex-1 py-5 bg-[#1a5f7a] text-white rounded-2xl font-black shadow-xl uppercase tracking-widest disabled:opacity-50">
                            {uploading ? 'Duke ruajtur...' : 'RUAJ NDRYSHIMET'}
                        </button>
                        <button type="button" onClick={() => setEditingArticle(null)} className="px-10 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest">Anulo</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {notification.show && (
        <div className={`fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-[0.2em] animate-in slide-in-from-right-10 duration-500 ${notification.type === 'success' ? 'bg-[#1a5f7a] text-white border-b-4 border-emerald-400' : 'bg-red-500 text-white border-b-4 border-red-200'}`}>
            {notification.message}
        </div>
      )}
    </div>
  );
}