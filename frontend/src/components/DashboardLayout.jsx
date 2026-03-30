import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 shrink-0 shadow-sm z-30">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                        EBM System
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto h-full overflow-y-auto pb-12">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
