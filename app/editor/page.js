"use client";
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function EditorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('create'); 
  const [articles, setArticles] = useState([]); 
  const [myArticles, setMyArticles] = useState([]); 
  const [archive, setArchive] = useState([]); 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // STATE PËR MODALIN E KONFIRMIMIT
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  // STATE PËR PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // STATE PËR FILTRAT
  const [searchFilters, setSearchFilters] = useState({
    title: '',
    author: '',
    date: ''
  });

  const [editingArticle, setEditingArticle] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'Lajme', image_url: '', video_url: '' });
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: pending } = await supabase
        .from('articles')
        .select('*, profiles(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const { data: mine } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      const { data: allArchive } = await supabase
        .from('articles')
        .select('*, profiles(full_name)')
        .neq('status', 'pending')
        .order('created_at', { ascending: false });

      const { data: usrs } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (pending) setArticles(pending);
      if (mine) setMyArticles(mine);
      if (allArchive) setArchive(allArchive);
      if (usrs) setUsers(usrs);

    } catch (err) {
      showToast("Gabim në marrjen e të dhënave", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchFilters]);

  const filteredArticles = useMemo(() => {
    const baseList = activeTab === 'articles' ? articles : archive;
    return baseList.filter(art => {
      // Titulli (Garda nëse mungon)
      const title = art.title || "";
      const matchesTitle = title.toLowerCase().includes(searchFilters.title.toLowerCase());
      
      // Autori (Trajtimi i objektit ose array-it nga join-i i Supabase)
      let authorName = "";
      if (art.profiles) {
        if (Array.isArray(art.profiles)) {
          authorName = art.profiles[0]?.full_name || "";
        } else {
          authorName = art.profiles.full_name || "";
        }
      }
      const matchesAuthor = authorName.toLowerCase().includes(searchFilters.author.toLowerCase());
      
      // Data (Garda nëse mungon created_at)
      const matchesDate = searchFilters.date ? (art.created_at || "").startsWith(searchFilters.date) : true;
      
      return matchesTitle && matchesAuthor && matchesDate;
    });
  }, [articles, archive, activeTab, searchFilters]);

  const filteredMyArticles = useMemo(() => {
    return myArticles.filter(art => {
      const title = art.title || "";
      const matchesTitle = title.toLowerCase().includes(searchFilters.title.toLowerCase());
      const matchesDate = searchFilters.date ? (art.created_at || "").startsWith(searchFilters.date) : true;
      return matchesTitle && matchesDate;
    });
  }, [myArticles, searchFilters.title, searchFilters.date]);

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredArticles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredArticles, currentPage]);

  const paginatedMyArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMyArticles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMyArticles, currentPage]);

  const totalPages = Math.ceil((activeTab === 'my_articles' ? filteredMyArticles.length : filteredArticles.length) / itemsPerPage);

  const handleFileUpload = async (e, type, isEditing = false) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

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
        if (type === 'images') setNewArticle(prev => ({ ...prev, image_url: prev.image_url ? `${prev.image_url}, ${data.publicUrl}` : data.publicUrl }));
        if (type === 'videos') setNewArticle(prev => ({ ...prev, video_url: prev.video_url ? `${prev.video_url}, ${data.publicUrl}` : data.publicUrl }));
      }
      showToast("Media u ngarkua!");
    } catch (error) {
      showToast("Gabim gjatë ngarkimit!", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('articles').insert([{
      ...newArticle,
      author_id: user.id,
      status: 'pending'
    }]);

    if (!error) {
      showToast("Lajmi u dërgua për miratim!");
      setNewArticle({ title: '', content: '', category: 'Lajme', image_url: '', video_url: '' });
      fetchData();
      setActiveTab('articles');
    }
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('articles')
      .update({
        title: editingArticle.title,
        content: editingArticle.content,
        category: editingArticle.category,
        image_url: editingArticle.image_url,
        video_url: editingArticle.video_url
      })
      .eq('id', editingArticle.id);

    if (!error) {
      showToast("Lajmi u përditësua me sukses!");
      setEditingArticle(null);
      setSelectedArticle(null);
      fetchData();
    }
  };

  // FSHIRJA E LAJMIT ME MODAL CUSTOM
  const triggerDeleteArticle = (id) => {
    setConfirmModal({
      show: true,
      title: "Fshi Lajmin",
      message: "A jeni i sigurt që dëshironi ta fshini këtë lajm? Ky veprim nuk mund të kthehet.",
      onConfirm: async () => {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (!error) {
          showToast("Lajmi u fshi!", "error");
          setSelectedArticle(null);
          fetchData();
        }
        setConfirmModal({ ...confirmModal, show: false });
      }
    });
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('articles').update({ status: newStatus }).eq('id', id);
    if (!error) {
      fetchData();
      setSelectedArticle(null);
      showToast(newStatus === 'published' ? "Lajmi u publikua!" : "Statusi u ndryshua!");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      showToast("Roli u përditësua!");
      fetchData();
    }
  };

  // FSHIRJA E PËRDORUESIT ME MODAL CUSTOM
  const triggerDeleteUser = (userId) => {
    setConfirmModal({
      show: true,
      title: "Fshi Përdoruesin",
      message: "Fshirja e përdoruesit është e pakthyeshme dhe do të hiqet nga sistemi.",
      onConfirm: async () => {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (!error) {
          showToast("Përdoruesi u fshi!", "error");
          fetchData();
        }
        setConfirmModal({ ...confirmModal, show: false });
      }
    });
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-4 mt-8">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className="px-4 py-2 bg-white border rounded-xl text-xs font-bold disabled:opacity-30"
        >
          Anterior
        </button>
        <span className="text-xs font-black text-[#1a5f7a]">Faqja {currentPage} nga {totalPages}</span>
        <button 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="px-4 py-2 bg-white border rounded-xl text-xs font-bold disabled:opacity-30"
        >
          Pasardhës
        </button>
      </div>
    );
  };

  if (!mounted) return <div className="h-screen flex items-center justify-center font-bold text-[#1a5f7a] animate-pulse">Duke ngarkuar BGT...</div>;
  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#1a5f7a] animate-pulse">Duke ngarkuar BGT...</div>;

  return (
    <div className="flex min-h-screen font-sans transition-colors duration-300">
      
      {/* NOTIFIKIMET TOAST */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-2xl shadow-2xl text-white font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      {/* MODALI I KONFIRMIMIT CUSTOM */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-[#1a5f7a] mb-2">{confirmModal.title}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">Anulo</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-600 transition-all">Konfirmo</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-72 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col p-6 sticky top-0 h-screen shadow-sm transition-colors duration-300">
        <div className="mb-10 flex items-center gap-4 px-2">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image src="/logo-bgt.png" alt="Logo" fill sizes="48px" className="object-contain dark:invert-[0.1]" priority />
          </div>
          <h1 className="text-xl font-black text-[#1a5f7a] dark:text-[#38bdf8]">BGT Panel</h1>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          <button onClick={() => { setActiveTab('create'); setSelectedArticle(null); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'create' ? 'bg-[#f59e0b] text-white shadow-lg' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            <span>✍️</span> Shkruaj Lajm
          </button>
          
          <button onClick={() => { setActiveTab('articles'); setSelectedArticle(null); }} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'articles' ? 'bg-[#1a5f7a] text-white shadow-xl' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            <span>📩</span> Pritje (Pending)
            <span className="px-2 py-0.5 rounded-lg text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-black">{articles.length}</span>
          </button>

          <button onClick={() => { setActiveTab('my_articles'); setSelectedArticle(null); }} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'my_articles' ? 'bg-[#1a5f7a] text-white shadow-xl' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            Lajmet e Mia
            <span className="px-2 py-0.5 rounded-lg text-[10px] bg-white/20">{myArticles.length}</span>
          </button>

          <button onClick={() => { setActiveTab('archive'); setSelectedArticle(null); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'archive' ? 'bg-[#1a5f7a] text-white shadow-xl' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            <span>📦</span> Arkiva / Postimet
          </button>

          <button onClick={() => { setActiveTab('users'); setSelectedArticle(null); }} className={`w-full flex items-center p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-[#1a5f7a] text-white shadow-xl' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            Përdoruesit
          </button>
        </nav>

        <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="mt-auto p-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left">🚪 Dalje</button>
      </div>

      <div className="flex-1 p-12 overflow-y-auto">
        
        {/* MODAL EDITIMI */}
        {editingArticle && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#1a5f7a]">Edito Lajmin</h2>
                <button onClick={() => setEditingArticle(null)} className="text-gray-400 font-bold hover:text-gray-600">Anulo</button>
              </div>
              <form onSubmit={handleUpdateArticle} className="space-y-4">
                <input required type="text" value={editingArticle.title} onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#1a5f7a] dark:text-slate-200" placeholder="Titulli..." />
                <select value={editingArticle.category || 'Lajme'} onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#1a5f7a] dark:text-slate-200 cursor-pointer">
                    <option value="Lajme">Lajme</option>
                    <option value="Sukseset">Sukseset</option>
                    <option value="Inovacioni">Inovacioni</option>
                    <option value="Sporti">Sporti</option>
                    <option value="Projektet">Projektet</option>
                    <option value="Klubet">Klubet</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Përditëso Foto (File / Linqe)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'images', true)} className="text-xs text-gray-400" />
                    <textarea rows="2" value={editingArticle.image_url || ''} onChange={(e) => setEditingArticle({...editingArticle, image_url: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#1a5f7a] dark:text-slate-300 resize-none" placeholder="Linqet e fotove..."></textarea>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Përditëso Video (File / Linqe)</label>
                    <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'videos', true)} className="text-xs text-gray-400" />
                    <textarea rows="2" value={editingArticle.video_url || ''} onChange={(e) => setEditingArticle({...editingArticle, video_url: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#1a5f7a] dark:text-slate-300 resize-none" placeholder="Linqet e videove..."></textarea>
                  </div>
                </div>
                <textarea required rows="8" value={editingArticle.content} onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-[#1a5f7a] dark:text-slate-300" placeholder="Përmbajtja..." />
                <button type="submit" className="w-full py-4 bg-[#1a5f7a] text-white rounded-2xl font-black uppercase shadow-lg hover:bg-[#144d63] transition-all">Ruaj Ndryshimet</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 1: KRIJO LAJM */}
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto text-left">
            <h2 className="text-3xl font-black mb-8 text-[#1e293b] dark:text-slate-200">Krijo Lajm të Ri</h2>
            <form onSubmit={handleSubmitArticle} className="space-y-6 bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-gray-50 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 mb-2 tracking-widest">Titulli i Lajmit</label>
                  <input required type="text" value={newArticle.title} onChange={(e) => setNewArticle({...newArticle, title: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1a5f7a] outline-none font-bold text-lg dark:text-slate-200" placeholder="Titulli..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 mb-2 tracking-widest">Kategoria</label>
                  <select value={newArticle.category} onChange={(e) => setNewArticle({...newArticle, category: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1a5f7a] outline-none font-bold text-lg dark:text-slate-200 cursor-pointer">
                      <option value="Lajme">Lajme</option>
                      <option value="Sukseset">Sukseset</option>
                      <option value="Inovacioni">Inovacioni</option>
                      <option value="Sporti">Sporti</option>
                      <option value="Projektet">Projektet</option>
                      <option value="Klubet">Klubet</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Foto (File ose Linqe ndarë me presje)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'images')} className="block w-full text-xs text-gray-500 cursor-pointer mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#1a5f7a]/10 file:text-[#1a5f7a]" />
                  <textarea rows="2" value={newArticle.image_url} onChange={(e) => setNewArticle({...newArticle, image_url: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1a5f7a] outline-none text-xs font-bold dark:text-slate-300 resize-none" placeholder="https://..."></textarea>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Video (File ose Linqe ndarë me presje)</label>
                  <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'videos')} className="block w-full text-xs text-gray-500 cursor-pointer mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#1a5f7a]/10 file:text-[#1a5f7a]" />
                  <textarea rows="2" value={newArticle.video_url} onChange={(e) => setNewArticle({...newArticle, video_url: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1a5f7a] outline-none text-xs font-bold dark:text-slate-300 resize-none" placeholder="https://youtube.com/..."></textarea>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 mb-2 tracking-widest">Teksti</label>
                <textarea required rows="8" value={newArticle.content} onChange={(e) => setNewArticle({...newArticle, content: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1a5f7a] outline-none text-lg dark:text-slate-300" placeholder="Shkruaj tekstin..."></textarea>
              </div>
              <button type="submit" disabled={uploading} className="w-full py-4 bg-[#1a5f7a] text-white rounded-2xl font-black shadow-xl disabled:opacity-50 uppercase">
                {uploading ? 'Duke ngarkuar...' : 'Dërgo për Miratim'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2 & 4: PRITJE DHE ARKIVA */}
        {(activeTab === 'articles' || activeTab === 'archive') && (
          <div className="max-w-6xl mx-auto text-left">
            <h2 className="text-3xl font-black mb-6 text-[#1e293b] dark:text-slate-200">
              {activeTab === 'articles' ? 'Miratimi i Lajmeve' : 'Arkiva e Përgjithshme'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-[30px] shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-2">Titulli</label>
                <input type="text" placeholder="Kërko titullin..." className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-[#1a5f7a] dark:text-slate-200" value={searchFilters.title} onChange={(e) => setSearchFilters({...searchFilters, title: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-2">Autori</label>
                <input type="text" placeholder="Kërko autorin..." className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-[#1a5f7a] dark:text-slate-200" value={searchFilters.author} onChange={(e) => setSearchFilters({...searchFilters, author: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-2">Data</label>
                <input type="date" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-[#1a5f7a] dark:text-slate-200 font-sans" value={searchFilters.date} onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                {paginatedArticles.length > 0 ? paginatedArticles.map(art => (
                  <div key={art.id} onClick={() => setSelectedArticle(art)} className={`p-5 rounded-3xl cursor-pointer transition-all border-2 ${selectedArticle?.id === art.id ? 'bg-white dark:bg-slate-900 border-[#1a5f7a] dark:border-[#38bdf8] shadow-xl' : 'bg-white dark:bg-slate-900 border-transparent hover:border-gray-100 dark:hover:border-slate-800 shadow-sm'}`}>
                    <h3 className="font-bold text-sm mb-1 text-[#1e293b] dark:text-slate-200 line-clamp-2">{art.title}</h3>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase">Nga: {art.profiles?.full_name}</p>
                      <p className="text-[9px] text-[#1a5f7a] dark:text-[#38bdf8] font-bold">{new Date(art.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : <div className="py-10 text-center text-gray-300 font-bold uppercase text-xs">Nuk u gjet asnjë rezultat</div>}
                <PaginationControls />
              </div>
              <div className="lg:col-span-2">
                {selectedArticle ? (
                  <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${selectedArticle.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>{selectedArticle.status}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingArticle(selectedArticle)} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-6 py-2 rounded-xl text-xs font-bold">Edito</button>
                        {activeTab === 'articles' ? (
                          <>
                            <button onClick={() => handleUpdateStatus(selectedArticle.id, 'archived')} className="px-4 py-2 text-xs font-bold text-red-500">Refuzo</button>
                            <button onClick={() => handleUpdateStatus(selectedArticle.id, 'published')} className="bg-[#1a5f7a] text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md">Publiko</button>
                            <button onClick={() => triggerDeleteArticle(selectedArticle.id)} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-2 rounded-xl text-xs font-bold">Fshij</button>
                          </>
                        ) : (
                          <button onClick={() => triggerDeleteArticle(selectedArticle.id)} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-2 rounded-xl text-xs font-bold">Fshij</button>
                        )}
                      </div>
                    </div>
                    {selectedArticle.image_url && (
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedArticle.image_url.split(',').filter(Boolean).map((img, idx) => (
                          <div key={idx} className="relative w-full h-64 rounded-3xl overflow-hidden shadow-sm">
                            <img src={img.trim()} alt={`Cover ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedArticle.video_url && (
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedArticle.video_url.split(',').filter(Boolean).map((vid, idx) => (
                          <div key={idx} className="relative w-full h-64 rounded-3xl overflow-hidden shadow-sm">
                            <video src={vid.trim()} controls className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <h1 className="text-3xl font-black mb-6 text-[#1a5f7a] dark:text-[#38bdf8] leading-tight">{selectedArticle.title}</h1>
                    <p className="text-gray-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedArticle.content}</p>
                  </div>
                ) : <div className="text-center py-20 text-gray-300 dark:text-slate-700 font-black border-4 border-dashed rounded-[40px] uppercase tracking-tighter">ZGJIDH NJË LAJM NGA LISTA</div>}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LAJMET E MIA */}
        {activeTab === 'my_articles' && (
          <div className="max-w-6xl mx-auto text-left">
            <h2 className="text-3xl font-black mb-8 text-[#1e293b] dark:text-slate-200">Lajmet e Shkruara nga Unë</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-[30px] shadow-sm border border-gray-100 dark:border-slate-800">
               <input type="text" placeholder="Kërko në titull..." className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none dark:text-slate-200" value={searchFilters.title} onChange={(e) => setSearchFilters({...searchFilters, title: e.target.value})} />
               <input type="date" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none dark:text-slate-200 font-sans" value={searchFilters.date} onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedMyArticles.length > 0 ? paginatedMyArticles.map(art => (
                <div key={art.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col group hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${art.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>{art.status}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => setEditingArticle(art)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">Edito</button>
                       <button onClick={() => triggerDeleteArticle(art.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold">Fshij</button>
                    </div>
                  </div>
                  <h3 className="font-bold text-[#1a5f7a] dark:text-[#38bdf8] text-lg mb-2">{art.title}</h3>
                  {art.image_url && <div className="mt-auto relative w-full h-40 rounded-2xl overflow-hidden mb-2"><img src={art.image_url.split(',')[0].trim()} alt="Media" className="w-full h-full object-cover" /></div>}
                  <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold">{new Date(art.created_at).toLocaleDateString()}</p>
                </div>
              )) : <div className="col-span-2 py-20 text-center text-gray-300 dark:text-slate-700 font-bold uppercase text-sm">Asnjë rezultat</div>}
            </div>
            <PaginationControls />
          </div>
        )}

        {/* TAB 5: PËRDORUESIT */}
        {activeTab === 'users' && (
          <div className="max-w-5xl mx-auto text-left">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-[#1e293b] dark:text-slate-200">Menaxhimi i Stafit</h2>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 rounded-xl text-xs font-bold outline-none text-[#1a5f7a] dark:text-[#38bdf8] shadow-sm">
                <option value="all">Të gjithë</option>
                <option value="editor">Editorë</option>
                <option value="gazetar">Gazetarë</option>
                <option value="viewer">Viewers</option>
              </select>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 dark:text-slate-500">Emri i Plotë</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 text-center">Roli Aktual</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 text-center">Ndrysho Rolin</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {users.filter(u => roleFilter === 'all' ? true : u.role === roleFilter).map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group">
                      <td className="p-6 font-bold text-[#1e293b] dark:text-slate-200">{u.full_name}</td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'editor' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : u.role === 'gazetar' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{u.role}</span>
                      </td>
                      <td className="p-6 text-center">
                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-2 rounded-xl text-xs font-bold outline-none dark:text-slate-200">
                          <option value="viewer">Viewer</option>
                          <option value="gazetar">Gazetar</option>
                          <option value="editor">Editor</option>
                        </select>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => triggerDeleteUser(u.id)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 font-bold text-xs">Fshij</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}