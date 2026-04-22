'use client';
import { useState, useEffect } from 'react';

export default function AdminPanel({ token }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Ubah role menjadi "${newRole}"?`)) return;
        try {
            await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, role: newRole })
            });
            fetchUsers();
        } catch (err) {
            console.error('Failed to toggle role:', err);
        }
    };

    const deleteUser = async (userId, email) => {
        if (!confirm(`Hapus akun "${email}" beserta semua datanya? Aksi ini tidak bisa dibatalkan.`)) return;
        try {
            await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex-1 bg-slate-50 p-10 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
                    <p className="text-sm text-slate-500 mt-1">Kelola pengguna dan hak akses</p>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Memuat...' : 'Refresh'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-slate-800">{users.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Papers</p>
                    <p className="text-2xl font-bold text-slate-800">{users.reduce((a, u) => a + u.paperCount, 0)}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Chats</p>
                    <p className="text-2xl font-bold text-slate-800">{users.reduce((a, u) => a + u.chatCount, 0)}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Email</th>
                                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Role</th>
                                <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Papers</th>
                                <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Chats</th>
                                <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Terdaftar</th>
                                <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Tidak ada pengguna</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-slate-700">{user.email}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider
                                                ${user.role === 'admin'
                                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center text-slate-600 font-medium">{user.paperCount}</td>
                                        <td className="px-5 py-3.5 text-center text-slate-600 font-medium">{user.chatCount}</td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(user.created_at)}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleRole(user.id, user.role)}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                                >
                                                    {user.role === 'admin' ? 'Set User' : 'Set Admin'}
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user.id, user.email)}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors bg-white text-red-500 border-red-200 hover:bg-red-50"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
