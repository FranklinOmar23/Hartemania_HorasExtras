import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Breadcrumb from './components/Breadcrumb';

// ============================================
// COMPONENTE MAIN LAYOUT
// Layout principal con sidebar y navbar
// ============================================

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_48%,_#f4f7fb_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Sidebar para móvil (overlay) */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Sidebar */}
      {/* ¡AQUÍ ESTÁ LA CORRECCIÓN! 
          1. Se eliminó lg:static lg:inset-0
          2. Se cambió transition-transform a transition-all para que la reducción a lg:w-20 sea suave 
      */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-[min(86vw,18rem)] transform transition-all duration-300 ease-in-out
          lg:w-64 lg:translate-x-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Contenido principal */}
      <div className={`
        relative flex min-h-screen flex-col transition-all duration-300
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        {/* Navbar */}
        <Navbar 
          onMenuClick={toggleMobileSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Breadcrumb */}
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <Breadcrumb />
        </div>

        {/* Contenido principal */}
        <main className="relative flex-1 px-4 pb-6 sm:px-6 sm:pb-8">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;