import { useRef, useState, useEffect } from 'react';

export default function Sidebar({
    chatSessions = [],
    activeSessionId,
    onSelectChat,
    onCreateNewChat,
    onDeleteChat,
    onRenameChat,
    onLogout,
    activeTab,
    onChangeTab
}) {
    return (
        <aside className="w-64 min-w-[256px] h-screen bg-white border-r border-slate-100 flex flex-col overflow-hidden">
            {/* Logo */}
            <div className="p-5 pb-3 flex items-center gap-3">
                <div>
                    <h1 className="text-[15px] font-bold text-blue-600 leading-tight">Skripsi Assistant</h1>
                    <p className="text-[11px] text-slate-400 leading-tight">Academic Tools</p>
                </div>
            </div>

            {/* New Chat Button */}
            <div className="p-4 pt-1 pb-2">
                <button
                    onClick={onCreateNewChat}
                    className="w-full flex items-center justify-center gap-2 text-white text-[13px] font-semibold py-2.5 px-4 rounded-xl transition-all bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>New Chat</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="px-3 py-1 space-y-0.5 cursor-pointer">
                <NavItem icon="library" label="Library" active={activeTab === 'library' || activeTab === 'recent_chats'} onClick={() => onChangeTab('library')} />
            </nav>

            {/* Recent Chats */}
            <div className="px-5 mt-4 mb-2 flex items-center justify-between">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Chats</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-1 pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                {chatSessions.map((chat) => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        isSelected={chat.id === activeSessionId && activeTab === 'chat'}
                        onSelect={() => onSelectChat(chat.id)}
                        onDelete={() => onDeleteChat?.(chat.id)}
                        onRename={(newTitle) => onRenameChat?.(chat.id, newTitle)}
                    />
                ))}
            </div>

            {/* Account Bottom Section */}
            <div className="p-3 border-t border-slate-50 mt-auto">
                <NavItem icon="logout" label="Logout" onClick={onLogout} />
            </div>
        </aside>
    );
}

function NavItem({ icon, label, active, onClick }) {
    const icons = {
        library: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
        ),
        logout: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
        ),
    };

    return (
        <button
            onClick={onClick}
            className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors border
                ${active
                    ? 'bg-blue-50/80 text-blue-700 border-blue-100'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 border-transparent hover:text-slate-900'}
            `}
        >
            <span className={active ? 'text-blue-600' : 'text-slate-400'}>{icons[icon]}</span>
            {label}
        </button>
    );
}

function ChatItem({ chat, isSelected, onSelect, onDelete, onRename }) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [editTitle, setEditTitle] = useState(chat.title || 'Chat Baru');
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
        if (editTitle.trim() !== '' && editTitle !== (chat.title || 'Chat Baru')) {
            onRename(editTitle);
        }
        setIsRenaming(false);
    };

    return (
        <div
            onClick={(e) => {
                if (e.target.closest('.no-drag')) return;
                onSelect();
            }}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border relative
                ${isSelected 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}
            `}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isSelected ? '#3b82f6' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    {isRenaming ? (
                        <input 
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={handleSaveRename}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename();
                                if (e.key === 'Escape') {
                                    setEditTitle(chat.title || 'Chat Baru');
                                    setIsRenaming(false);
                                }
                            }}
                            className="text-[12px] font-semibold text-slate-800 bg-white border border-blue-300 rounded px-1 py-0.5 outline-none w-[90%] shadow-sm no-drag"
                        />
                    ) : (
                        <p 
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                setIsRenaming(true);
                            }}
                            className={`text-[12px] font-semibold truncate ${isSelected ? 'text-slate-800' : 'text-slate-700'}`}
                            title={chat.title || 'Chat Baru'}
                        >
                            {chat.title || 'Chat Baru'}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity no-drag ml-1" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-8 w-32 bg-white rounded-md shadow-lg border border-slate-100 py-1 z-50">
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
        </div>
    );
}
