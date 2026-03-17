import React from 'react';
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

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Izquierda */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Menu size={24} />
          </button>
          
          <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-gray-800">
            {getPageTitle()}
          </h1>
        </div>

        {/* Derecha */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full relative"
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
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notificaciones
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                            !notif.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm text-gray-900">{notif.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No hay notificaciones
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Ver todas
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                Admin User
              </span>
            </button>

            {/* Dropdown usuario */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <a
                    href="/perfil"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} className="mr-2" />
                    Mi Perfil
                  </a>
                  <a
                    href="/configuracion"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} className="mr-2" />
                    Configuración
                  </a>
                  <hr className="my-1" />
                  <button
                    onClick={() => console.log('Logout')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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