import React from 'react';
import PublicNavbar from '../nav/PublicNavbar.jsx';

export function PublicAuthLayout({ children }) {
    return (
        <div className="min-h-screen relative flex flex-col bg-[#f7f9fc] text-gray-800 font-sans selection:bg-[#0a47d4]/30 selection:text-white">
            <PublicNavbar />
            
            <div className="flex-1 relative flex items-center justify-center py-12">
                {/* Minimal Background Decor */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-50 rounded-full blur-3xl"></div>
                </div>

                {/* Content (Card) */}
                <main className="relative z-10 w-full max-w-md px-4">
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-blue-900/5 border border-gray-100">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PublicAuthLayout;
