import React, { useState } from 'react';
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para móvil (overlay) */}
      <div
        className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden ${
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
          fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-20'}
          ${mobileSidebarOpen ? 'translate-x-0' : ''}
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
        flex flex-col min-h-screen transition-all duration-300
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        {/* Navbar */}
        <Navbar 
          onMenuClick={toggleMobileSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Breadcrumb */}
        <div className="px-6 py-4">
          <Breadcrumb />
        </div>

        {/* Contenido principal */}
        <main className="flex-1 px-6 pb-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;