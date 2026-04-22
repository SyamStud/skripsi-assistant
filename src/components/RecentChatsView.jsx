'use client';

export default function RecentChatsView({ chatSessions, onSelectChat, onCreateNewChat }) {
    if (!chatSessions || chatSessions.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8" style={{ gap: '1rem' }}>
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600   shadow-blue-100">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                </div>
                <div className="text-center flex flex-col mb-2" style={{ gap: '0.5rem' }}>
                    <h2 className="text-xl font-semibold text-slate-800">Belum ada riwayat chat</h2>
                    <p className="text-sm text-slate-500">Mulai diskusi baru untuk membahas koleksi paper Anda.</p>
                </div>
                <button
                    onClick={onCreateNewChat}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition   text-sm"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Buat Room Chat Baru
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-slate-50 p-10 overflow-y-auto">
            <div className="flex justify-between items-end mb-8 max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-800">Ruang Diskusi</h2>
                <button
                    onClick={onCreateNewChat}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition   text-sm"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Buat Baru
                </button>
            </div>
            
            <div className="flex flex-col gap-3 max-w-4xl">
                {chatSessions.map((session) => {
                    const messages = session.messages || [];
                    const lastMessage = messages[messages.length - 1];
                    const lastDate = session.updated_at ? new Date(session.updated_at).toLocaleDateString() : '';

                    return (
                        <div
                            key={session.id}
                            onClick={() => onSelectChat(session.id)}
                            className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-200 cursor-pointer transition-all hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-[15px] font-semibold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {session.title || 'Chat Baru'}
                                    </h3>
                                    <span className="text-xs text-slate-400 shrink-0 ml-3">{lastDate}</span>
                                </div>
                                <p className="text-[13px] text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis m-0">
                                    {lastMessage?.content || 'Belum ada pesan. Buka untuk memulai diskusi.'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
