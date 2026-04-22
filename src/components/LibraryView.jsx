'use client';
import { useState, useRef, useEffect } from 'react';

export default function LibraryView({ papers, onSelectPaper, onUpload, isUploading, onDeletePaper, onRenamePaper, quota }) {
    const isQuotaFull = quota && !quota.isAdmin && quota.isDemo && quota.limits && quota.usage.papers >= quota.limits.maxUploads;
    return (
        <div className="flex-1 bg-slate-50 p-10 overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">My Library</h2>
            
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                
                {/* Upload Card */}
                <div 
                    onClick={() => !isUploading && !isQuotaFull && document.getElementById('lib-upload').click()} 
                    className={`flex flex-col items-center justify-center cursor-pointer border-2 border-dashed rounded-md p-4 transition-all duration-200 min-h-[280px] group mb-[34px] ${isQuotaFull ? 'border-red-200 bg-red-50/50 cursor-not-allowed' : 'border-slate-300 bg-slate-100 hover:border-blue-500 hover:bg-blue-50'} ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <input 
                        id="lib-upload" 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                onUpload(file);
                                e.target.value = '';
                            }
                        }} 
                    />
                    {isUploading ? (
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                    ) : (
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center   mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    )}
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600">
                        {isUploading ? 'Uploading...' : isQuotaFull ? 'Kuota Penuh' : 'Upload PDF'}
                    </span>
                    {isQuotaFull && (
                        <span className="text-[10px] text-red-500 mt-1 font-medium">Maks. {quota.limits.maxUploads} file (demo)</span>
                    )}
                </div>

                {papers.map((paper) => (
                    <PaperCard 
                        key={paper.id} 
                        paper={paper} 
                        onSelect={() => onSelectPaper(paper.id)} 
                        onDelete={() => onDeletePaper(paper.id)}
                        onRename={(newTitle) => onRenamePaper(paper.id, newTitle)}
                    />
                ))}
            </div>
        </div>
    );
}

function PaperCard({ paper, onSelect, onDelete, onRename }) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [editTitle, setEditTitle] = useState(paper.title || paper.filename);
    const [showPreview, setShowPreview] = useState(false);
    
    // For dropdown menu
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveRename = () => {
        if (editTitle.trim() !== '' && editTitle !== (paper.title || paper.filename)) {
            onRename(editTitle);
        }
        setIsRenaming(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="group flex flex-col relative">
            {/* PDF Cover Representation */}
            <div 
                onClick={(e) => {
                    // Prevent navigation if clicking input or menu elements
                    if(e.target.closest('.no-drag')) return;
                    onSelect();
                }}
                className="cursor-pointer w-full aspect-[1/1.414] bg-white rounded-md border border-slate-200 p-4 flex flex-col transition-all duration-200 mb-2 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300"
            >
                {/* 3 dots Menu Button */}
                <div className="absolute top-2 right-2 no-drag" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                        title="Opsi"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                        </svg>
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-slate-100 py-1 z-50">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    setIsRenaming(true);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                            >
                                Rename
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    onDelete();
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                            >
                                Hapus
                            </button>
                        </div>
                    )}
                </div>

                {/* PDF Content Placeholder lines */}
                <div className="text-xs font-extrabold text-slate-800 mb-2 leading-tight line-clamp-3">
                    {paper.title || paper.filename}
                </div>
                <div className="text-[9px] text-slate-500 mb-3 italic">
                    {paper.authors ? paper.authors : 'Unknown Author'} {paper.year ? `(${paper.year})` : ''}
                </div>
                
                <div className="flex-1 flex flex-col gap-1.5 opacity-60">
                    <div className="h-1 bg-slate-100 rounded-full w-[90%]" />
                    <div className="h-1 bg-slate-100 rounded-full w-full" />
                    <div className="h-1 bg-slate-100 rounded-full w-[85%]" />
                    <div className="h-1 bg-slate-100 rounded-full w-[95%]" />
                    <div className="h-1 bg-slate-100 rounded-full w-[60%]" />
                </div>
                
                {/* Embedded Preview Button (bottom of cover layout) */}
                <div className="no-drag absolute bottom-3 right-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPreview(true);
                        }}
                        className="w-full py-1.5 bg-blue-50/90 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded shadow-sm border border-blue-200"
                    >
                        Preview Ringkasan
                    </button>
                </div>

                {/* Status indicator on cover */}
                {paper.status === 'error' && (
                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-red-500" title="Processing Error" />
                )}
            </div>

            {/* Title / Info block */}
            <div className="px-1 flex-1 flex flex-col pb-2">
                {isRenaming ? (
                    <input 
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onBlur={handleSaveRename}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveRename();
                            if (e.key === 'Escape') {
                                setEditTitle(paper.title || paper.filename);
                                setIsRenaming(false);
                            }
                        }}
                        className="text-[13px] font-semibold text-slate-700 bg-white border border-blue-300 rounded px-1 py-0.5 outline-none mb-1 shadow-sm"
                    />
                ) : (
                    <p 
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            setIsRenaming(true);
                        }}
                        className="text-[13px] font-semibold text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-blue-600 transition-colors cursor-text"
                        title={paper.title || paper.filename}
                    >
                        {paper.title || paper.filename}
                    </p>
                )}
                
                {/* Upload date */}
                <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatDate(paper.created_at)}
                </p>
            </div>

            {/* Simple Modal Preview */}
            {showPreview && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div 
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col no-drag overflow-hidden"
                        style={{ animation: 'slideUp 0.3s ease-out' }}
                    >
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 truncate pr-4 text-base">{paper.title || paper.filename}</h3>
                            <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-700 p-1 bg-white rounded-md border border-slate-200">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                <div>
                                    <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider font-semibold">Penulis</span>
                                    <span className="text-slate-700 font-medium">{paper.authors || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider font-semibold">Tahun Publikasi</span>
                                    <span className="text-slate-700 font-medium">{paper.year || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider font-semibold">Kata Kunci</span>
                                    <span className="text-slate-700 font-medium whitespace-pre-wrap">{paper.keywords?.join(', ') || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider font-semibold">Tanggal Upload</span>
                                    <span className="text-slate-700 font-medium">{formatDate(paper.created_at)}</span>
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-5">
                                <span className="text-slate-400 block text-xs mb-3 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                    Ringkasan Ekstraksi AI
                                </span>
                                <div className="text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-lg border border-blue-100/50 text-justify">
                                    {paper.summary ? (
                                        paper.summary.split('\n').map((paragraph, idx) => (
                                            paragraph.trim() ? <p key={idx} className="mb-3.5 last:mb-0">{paragraph}</p> : null
                                        ))
                                    ) : (
                                        'Summary belum tersedia.'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
