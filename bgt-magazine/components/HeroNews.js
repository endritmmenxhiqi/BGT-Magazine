"use client";
import React from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Clock, User } from 'lucide-react';

export default function HeroNews({ articles }) {
  if (!articles || articles.length === 0) return null;
  
  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 5); // 4 side articles for 2x2 grid

  return (
    <section className="bg-white pt-56 pb-12 transition-all duration-1000">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Replica 1+4 Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Main Large Feature Card (Left 65%) */}
          <div className="lg:col-span-8 h-[600px] relative rounded-xl overflow-hidden group shadow-md">
            <Link href={`/lajm/${mainArticle.id}`} className="block h-full w-full">
              {mainArticle.image_url ? (
                <NextImage 
                  src={mainArticle.image_url.split(/[\n,]+/)[0].trim()} 
                  alt={mainArticle.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                   <span className="serif text-6xl font-black uppercase tracking-widest text-white opacity-10">BGT MAGAZINE</span>
                </div>
              )}
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 hero-overlay"></div>

              {/* Tag */}
              <div className="absolute top-6 left-6 z-20">
                 <span className="px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                    LAJME
                 </span>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-10 z-20">
                 <h2 className="serif text-4xl lg:text-5xl font-black text-white leading-tight mb-6 tracking-tight group-hover:text-gray-200 transition-colors">
                    {mainArticle.title}
                 </h2>
                 <p className="text-white/70 text-lg font-medium leading-relaxed mb-8 line-clamp-2 max-w-3xl">
                    {mainArticle.content}
                 </p>
                 
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden">
                          <User className="w-5 h-5 text-white opacity-60" />
                       </div>
                       <span className="text-[12px] font-bold text-white uppercase tracking-widest">{mainArticle.profiles?.full_name || 'Redaksia'}</span>
                    </div>
                    <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                       {new Date(mainArticle.created_at).toLocaleDateString('sq-AL', { month: 'short', day: 'numeric' })}
                    </span>
                 </div>
              </div>

              {/* Dot Indicators Style */}
              <div className="absolute bottom-10 right-10 flex gap-1.5 z-20">
                 <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
              </div>
            </Link>
          </div>

          {/* Right Column (2x2 Grid) */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
             {sideArticles.map((art, idx) => (
                <Link 
                    key={art.id} 
                    href={`/lajm/${art.id}`}
                    className="group relative h-[290px] rounded-xl overflow-hidden shadow-sm"
                >
                    {art.image_url ? (
                        <NextImage 
                            src={art.image_url.split(/[\n,]+/)[0].trim()} 
                            alt={art.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-900 border border-gray-100"></div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                    {/* Tag */}
                    <div className="absolute top-4 left-4">
                       <span className="px-2.5 py-1 bg-black/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                          {art.category || (idx % 2 === 0 ? 'BIZNES' : 'TEKNOLOGJI')}
                       </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="serif text-base lg:text-lg font-bold text-white leading-tight mb-3 line-clamp-3 group-hover:text-gray-300 transition-colors">
                            {art.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                           <Clock className="w-3 h-3" />
                           <span>{idx + 1} orë më parë</span>
                        </div>
                    </div>
                </Link>
             ))}
             
             {/* Dynamic Empty State Filler */}
             {sideArticles.length < 4 && [...Array(4 - sideArticles.length)].map((_, i) => (
                <div key={i} className="bg-gray-50 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-100 opacity-20">
                   <span className="serif text-sm font-bold uppercase tracking-widest">Më shumë</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
