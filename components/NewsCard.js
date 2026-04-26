"use client";
import React from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function NewsCard({ article }) {
  if (!article) return null;

  return (
    <div className="group flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 border border-transparent hover:border-gray-50 h-full p-2">
      
      {/* Horizontal Image Container (Left) */}
      {article.image_url && (
        <Link href={`/lajm/${article.id}`} className="relative aspect-video md:w-48 lg:w-64 max-h-[300px] overflow-hidden rounded-lg block">
          <NextImage 
            src={article.image_url.split(/[\n,]+/)[0].trim()} 
            alt={article.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>
      )}

      {/* Horizontal Content Container (Right) */}
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">
                {article.category || 'AKTIVITET'}
            </span>
        </div>

        <h3 className="serif text-lg lg:text-xl font-bold text-black mb-3 leading-snug group-hover:text-gray-600 transition-colors line-clamp-2">
          <Link href={`/lajm/${article.id}`}>
            {article.title}
          </Link>
        </h3>

        <p className="hidden lg:line-clamp-2 text-slate-500 text-sm leading-relaxed mb-4 opacity-70">
          {article.content}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-gray-50 pt-4">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[8px] font-black uppercase">
                    {article.profiles?.full_name?.charAt(0) || 'B'}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                    {article.profiles?.full_name || 'BGT Media'}
                </span>
            </div>
            <div className="h-2 w-px bg-gray-200"></div>
            <span className="px-3 py-1 bg-[#13637a] text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                {article.category || 'LAJME'}
            </span>
            <div className="h-2 w-px bg-gray-200"></div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                <span>{new Date(article.created_at).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
