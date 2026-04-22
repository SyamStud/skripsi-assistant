export default function WelcomeScreen({ onDrop }) {
    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-active');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-active');
    };

    const handleDropAction = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-active');
        onDrop(e);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8">
            <div 
                className="w-full max-w-4xl max-h-[80vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-16 transition-colors  "
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropAction}
            >
                <div className="w-20 h-20 bg-blue-50 bg-opacity-80 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 flex-shrink-0">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                </div>
                
                <div className="flex flex-col items-center" style={{ gap: '1rem' }}>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Selamat datang di Skripsi Assistant
                    </h2>
                    <p className="text-slate-500 text-center max-w-lg leading-relaxed mb-6">
                        Platform asisten penelitian pintar Anda. Pilih menu di sebelah kiri untuk melihat Library atau melanjutkan obrolan. Anda juga dapat menyeret dokumen PDF ke area ini.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
                    <FeatureCard 
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        }
                        title="Instant Summary"
                        desc="Dapatkan ringkasan abstrak dan metodologi tanpa harus membaca berhalaman-halaman teks."
                        bgColor="bg-blue-50"
                    />
                    <FeatureCard 
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                        }
                        title="Deep Q&A"
                        desc="Tanyakan pertanyaan kompleks dan dapatkan jawaban terperinci langsung dari sumber rujukan dokumen Anda."
                        bgColor="bg-amber-50"
                    />
                    <FeatureCard 
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                        }
                        title="Multi-Document"
                        desc="Pilih beberapa jurnal sekaligus di dalam satu ruang obrolan untuk melakukan kajian literatur campuran."
                        bgColor="bg-slate-100"
                    />
                </div>

                <div className="mt-12 flex items-center text-slate-400 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mr-2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Anda juga dapat melakukan drag and drop PDF langsung ke layar ini.
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc, bgColor }) {
    return (
        <div className="bg-slate-50 rounded-2xl p-6 transition-transform hover:-translate-y-1 hover: ">
            <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );
}
