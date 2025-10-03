import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div 
            className="w-[95%] h-[95%] max-w-7xl mx-auto bg-gray-900/40 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        >
            {/* Top bar simulation */}
            <div className="flex-shrink-0 h-10 bg-black/10 flex items-center px-4">
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </div>

            {/* Main content area */}
            <main className="flex-grow p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;