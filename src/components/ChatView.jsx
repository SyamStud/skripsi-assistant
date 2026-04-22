import { useEffect, useRef, useState } from 'react';

export default function ChatView({ chatSession, papers, onSendMessage, isSending, onUpdateContext }) {
    const messagesEndRef = useRef(null);
    const [query, setQuery] = useState('');
    const [showContextOptions, setShowContextOptions] = useState(false);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatSession?.messages, isSending]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim() && !isSending) {
            onSendMessage(query.trim());
            setQuery('');
        }
    };

    const toggleContextPaper = (paperId) => {
        const currentContexts = chatSession.context_paper_ids || [];
        let newContexts;
        if (currentContexts.includes(paperId)) {
            newContexts = currentContexts.filter(id => id !== paperId);
        } else {
            newContexts = [...currentContexts, paperId];
        }
        onUpdateContext(chatSession.id, newContexts);
    };

    if (!chatSession) return null;

    const messages = chatSession.messages || [];
    const contextPaperIds = chatSession.context_paper_ids || [];

    return (
        <div className="flex-1 flex flex-col bg-white h-screen">
            {/* Header */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0 relative z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        {chatSession.title || 'Chat Baru'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        {messages.length} pesan
                    </p>
                </div>

                {/* Context Selector Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setShowContextOptions(!showContextOptions)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        <span>Konteks File: {contextPaperIds.length} terpilih</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showContextOptions ? 'rotate-180' : ''}`}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {showContextOptions && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                                Pilih Dokumen Referensi
                            </div>
                            {papers.length === 0 ? (
                                <div className="text-sm text-slate-500 px-2 py-1">Belum ada paper di Library</div>
                            ) : (
                                papers.map(paper => (
                                    <label key={paper.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-0 focus:outline-none outline-none border-slate-300"
                                            checked={contextPaperIds.includes(paper.id)}
                                            onChange={() => toggleContextPaper(paper.id)}
                                        />
                                        <span className="text-sm text-slate-700 truncate">{paper.title || paper.filename}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 scroll-smooth">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Mulai Riset Anda</h3>
                            <p className="text-slate-500">Ajukan pertanyaan! Jangan lupa memilih konteks di sudut kanan atas agar Skripsi Assistant tahu referensinya.</p>
                        </div>
                    )}
                    
                    {messages.map((message, i) => (
                        <div
                            key={i}
                            className={`flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`message-animate inline-block max-w-[85%] rounded-2xl px-5 py-3.5   text-[15px] leading-relaxed
                                    ${
                                        message.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
                                    }
                                `}
                            >
                                <p className="whitespace-pre-wrap text-justify">{message.content}</p>
                                
                                {/* Dihapus: Bagian "Sumber" */}
                            </div>
                        </div>
                    ))}

                    {isSending && (
                        <div className="flex justify-start">
                            <div className="message-animate bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-bl-sm px-5 py-4   flex gap-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="relative flex items-center"
                    >
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tanyakan sesuatu pada Skripsi Assistant..."
                            disabled={isSending || contextPaperIds.length === 0}
                            className={`w-full bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-xl pl-5 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors  
                                ${(isSending || contextPaperIds.length === 0) ? 'opacity-60 cursor-not-allowed' : ''}
                            `}
                        />
                        <button
                            type="submit"
                            disabled={!query.trim() || isSending || contextPaperIds.length === 0}
                            className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </form>
                    <p className="mt-2 text-center text-xs text-slate-400">
                        {contextPaperIds.length === 0 ? (
                            <span className="text-amber-600 font-medium">Anda harus memilih setidaknya 1 paper sebagai konteks ruang obrolan ini!</span>
                        ) : (
                            'Skripsi Assistant dapat membuat kesalahan. Harap periksa ulang.'
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
