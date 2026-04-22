'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import WelcomeScreen from '@/components/WelcomeScreen';
import ChatView from '@/components/ChatView';
import LibraryView from '@/components/LibraryView';
import AuthView from '@/components/AuthView';
import AdminPanel from '@/components/AdminPanel';
import { supabase } from '@/lib/supabase';

export default function Home() {
    const [session, setSession] = useState(null);
    const [papers, setPapers] = useState([]);
    const [chatSessions, setChatSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [activeTab, setActiveTab] = useState('library');
    const [isUploading, setIsUploading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [quota, setQuota] = useState(null);

    const getToken = useCallback(() => {
        return session?.access_token || '';
    }, [session]);

    const authHeaders = useCallback((extra = {}) => {
        return {
            'Authorization': `Bearer ${getToken()}`,
            ...extra,
        };
    }, [getToken]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoadingAuth(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchQuota = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/quota', { headers: authHeaders() });
            const data = await res.json();
            setQuota(data);
        } catch (e) {
            console.error('Failed to fetch quota:', e);
        }
    }, [session, authHeaders]);

    const fetchPapers = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/papers', { headers: authHeaders() });
            const data = await res.json();
            setPapers(data.papers || []);
        } catch (error) {
            console.error('Failed to fetch papers:', error);
        }
    }, [session, authHeaders]);

    const fetchChatSessions = useCallback(async () => {
        if (!session) return;
        try {
            const res = await fetch('/api/chats', { headers: authHeaders() });
            const data = await res.json();
            setChatSessions(data.sessions || []);
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    }, [session, authHeaders]);

    useEffect(() => {
        if (session) {
            fetchPapers();
            fetchChatSessions();
            fetchQuota();
        }
    }, [session, fetchPapers, fetchChatSessions, fetchQuota]);

    const handleUpload = useCallback(async (file) => {
        if (!file || !session) return;

        // Client-side quota check
        if (quota && !quota.isAdmin && quota.isDemo && quota.limits) {
            if (quota.usage.papers >= quota.limits.maxUploads) {
                alert(`Kuota upload habis (${quota.usage.papers}/${quota.limits.maxUploads}). Maksimal ${quota.limits.maxUploads} file dalam mode demo.`);
                return;
            }
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Upload gagal');
                return;
            }
            if (data.paper) {
                setPapers((prev) => [data.paper, ...prev]);
                fetchQuota(); // refresh quota
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    }, [session, getToken, quota, fetchQuota]);

    const handleRenamePaper = async (paperId, newTitle) => {
        setPapers((prev) => prev.map((p) => p.id === paperId ? { ...p, title: newTitle } : p));
        try {
            await fetch(`/api/papers/${paperId}`, {
                method: 'PUT',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ title: newTitle })
            });
        } catch (error) {
            console.error('Rename paper failed:', error);
            fetchPapers();
        }
    };

    const handleDeletePaper = useCallback(async (paperId) => {
        try {
            const res = await fetch(`/api/papers/${paperId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (res.ok) {
                setPapers((prev) => prev.filter((p) => p.id !== paperId));
                fetchQuota();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    }, [authHeaders, fetchQuota]);

    const handleCreateChat = async (context_paper_ids = [], title = 'Chat Baru') => {
        if (!session) return;



        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ context_paper_ids, title })
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Gagal membuat chat');
                return;
            }
            if (data.session) {
                setChatSessions((prev) => [data.session, ...prev]);
                setActiveSessionId(data.session.id);
                setActiveTab('chat');
                fetchQuota();
            }
        } catch (error) {
            console.error('Create chat failed', error);
        }
    };

    const handleRenameChat = async (chatId, newTitle) => {
        setChatSessions((prev) => prev.map((s) => s.id === chatId ? { ...s, title: newTitle } : s));
        try {
            await fetch(`/api/chats/${chatId}`, {
                method: 'PUT',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ title: newTitle })
            });
        } catch (error) {
            console.error('Rename chat failed:', error);
            fetchChatSessions();
        }
    };

    const handleDeleteChat = async (chatId) => {
        try {
            const res = await fetch(`/api/chats/${chatId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (res.ok) {
                setChatSessions((prev) => prev.filter((s) => s.id !== chatId));
                if (activeSessionId === chatId) {
                    setActiveSessionId(null);
                    setActiveTab('library');
                }
                fetchQuota();
            }
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    };

    const handleUpdateContext = async (sessionId, paperIds) => {
        try {
            await fetch(`/api/chats/${sessionId}`, {
                method: 'PUT',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ context_paper_ids: paperIds })
            });
            setChatSessions(prev =>
                prev.map(s => s.id === sessionId ? { ...s, context_paper_ids: paperIds } : s)
            );
        } catch (e) {
            console.error('failed updating context', e);
        }
    };

    const handleSendMessage = useCallback(async (query) => {
        if (!activeSessionId || isSending) return;

        const activeSession = chatSessions.find(s => s.id === activeSessionId);
        const userMessage = { role: 'user', content: query };

        setChatSessions((prev) => prev.map(s =>
            s.id === activeSessionId ? { ...s, messages: [...(s.messages || []), userMessage] } : s
        ));
        setIsSending(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    query,
                    sessionId: activeSessionId,
                    contextPaperIds: activeSession?.context_paper_ids || []
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal memproses');
            }

            const assistantMessage = {
                role: 'assistant',
                content: data.answer || data.error || 'Tidak ada respon',
                sources: data.sources || [],
            };

            setChatSessions((prev) => prev.map(s =>
                s.id === activeSessionId ? { ...s, messages: [...(s.messages || []), assistantMessage] } : s
            ));

            fetch(`/api/chats/${activeSessionId}`, {
                method: 'PUT',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ messages: [...(activeSession?.messages || []), userMessage, assistantMessage] })
            }).then(() => fetchQuota());

        } catch (error) {
            console.error('Chat failed:', error);
            const errorMessage = {
                role: 'assistant',
                content: error.message || 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                sources: [],
            };
            setChatSessions((prev) => prev.map(s =>
                s.id === activeSessionId ? { ...s, messages: [...(s.messages || []), errorMessage] } : s
            ));
        } finally {
            setIsSending(false);
        }
    }, [activeSessionId, isSending, chatSessions, authHeaders]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setQuota(null);
        setPapers([]);
        setChatSessions([]);
        setActiveSessionId(null);
        setActiveTab('library');
    };

    if (loadingAuth) {
        return <div className="flex bg-white items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!session) {
        return <AuthView onAuthSuccess={fetchPapers} />;
    }

    const activeChatOptions = chatSessions.find(s => s.id === activeSessionId);

    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar
                chatSessions={chatSessions}
                activeSessionId={activeSessionId}
                onSelectChat={(id) => {
                    setActiveSessionId(id);
                    setActiveTab('chat');
                }}
                onCreateNewChat={() => handleCreateChat()}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
                onLogout={handleLogout}
                activeTab={activeTab}
                onChangeTab={(tab) => {
                    setActiveTab(tab);
                    if (tab === 'library') setActiveSessionId(null);
                }}
                quota={quota}
            />

            {activeTab === 'admin' && quota?.isAdmin ? (
                <AdminPanel token={getToken()} />
            ) : activeSessionId && activeChatOptions ? (
                <ChatView
                    chatSession={activeChatOptions}
                    papers={papers}
                    onSendMessage={handleSendMessage}
                    isSending={isSending}
                    onUpdateContext={handleUpdateContext}
                    quota={quota}
                />
            ) : activeTab === 'library' ? (
                <LibraryView
                    papers={papers}
                    onUpload={handleUpload}
                    isUploading={isUploading}
                    onDeletePaper={handleDeletePaper}
                    onRenamePaper={handleRenamePaper}
                    onSelectPaper={(id) => {
                        const paper = papers.find(p => p.id === id);
                        handleCreateChat([id], `Chat: ${paper?.title || paper?.filename}`);
                    }}
                    quota={quota}
                />
            ) : (
                <WelcomeScreen
                    onDrop={handleUpload}
                />
            )}
        </div>
    );
}
