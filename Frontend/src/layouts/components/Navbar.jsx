import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, User, Settings, LogOut } from 'lucide-react';
import { useUIStore } from '../../store';

// ============================================
// COMPONENTE NAVBAR
// Barra superior de navegación
// ============================================

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  
  // Obtener título de la página según la ruta
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path.includes('/empleados')) return 'Empleados';
    if (path.includes('/importacion')) return 'Importar Excel';
    if (path.includes('/registros')) return 'Registros';
    if (path.includes('/calculos')) return 'Cálculos';
    if (path.includes('/reportes')) return 'Reportes';
    if (path.includes('/configuracion')) return 'Configuración';
    
    return 'Hartemania Overtime';
  };

  // Notificaciones de ejemplo
  const notifications = [
    { id: 1, text: 'Importación completada', time: 'Hace 5 min', read: false },
    { id: 2, text: 'Cálculo de quincena listo', time: 'Hace 1 hora', read: false },
    { id: 3, text: 'Límite legal alcanzado', time: 'Hace 2 horas', read: true }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-30 border-b border-white/70 bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
        {/* Izquierda */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Menu size={24} />
          </button>
          
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
              {getPageTitle()}
            </h1>
            <p className="hidden text-xs uppercase tracking-[0.22em] text-slate-400 md:block">
              Hartemania Horas Extras
            </p>
          </div>
        </div>

        {/* Derecha */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 md:block">
            Operacion en vivo
          </div>

          {/* Notificaciones */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[min(92vw,20rem)] sm:w-80 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-900/10 z-50 backdrop-blur">
                <div className="py-2">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Notificaciones
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`cursor-pointer px-4 py-3 transition hover:bg-slate-50 ${
                            !notif.read ? 'bg-emerald-50/70' : ''
                          }`}
                        >
                          <p className="text-sm text-slate-900">{notif.text}</p>
                          <p className="mt-1 text-xs text-slate-500">{notif.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No hay notificaciones
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3">
                    <button className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                      Ver todas
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menú de usuario */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 text-white shadow-sm">
                <User size={16} />
              </div>
              <span className="hidden text-sm font-medium text-slate-700 md:block">
                Admin User
              </span>
            </button>

            {/* Dropdown usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-[min(84vw,14rem)] sm:w-56 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-900/10 z-50 backdrop-blur">
                <div className="py-1">
                  <a
                    href="/perfil"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User size={16} className="mr-2" />
                    Mi Perfil
                  </a>
                  <a
                    href="/configuracion"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={16} className="mr-2" />
                    Configuración
                  </a>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => console.log('Logout')}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} className="mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;