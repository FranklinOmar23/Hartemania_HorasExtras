import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Upload,
  Calendar,
  Calculator,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3
} from 'lucide-react';
import { ROUTES } from '../../config/constants';

// ============================================
// COMPONENTE SIDEBAR
// Barra lateral de navegación
// ============================================

const Sidebar = ({ isOpen, onToggle, onMobileClose }) => {
  // ========================================
  // MENÚ ITEMS
  // ========================================
  const menuItems = [
    {
      path: ROUTES.DASHBOARD,
      name: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: ROUTES.EMPLEADOS,
      name: 'Empleados',
      icon: Users
    },
    {
      path: ROUTES.IMPORTACION,
      name: 'Importar Excel',
      icon: Upload
    },
    {
      path: ROUTES.REGISTROS,
      name: 'Registros',
      icon: Calendar,
      submenu: [
        { path: ROUTES.REGISTROS, name: 'Lista de Registros', icon: Clock },
        { path: ROUTES.REGISTROS_MANUAL, name: 'Registro Manual', icon: Calendar }
      ]
    },
    {
      path: ROUTES.CALCULOS,
      name: 'Cálculos',
      icon: Calculator
    },
    {
      path: ROUTES.REPORTES,
      name: 'Reportes',
      icon: FileText,
      submenu: [
        { path: '/reportes/quincenal', name: 'Quincenal', icon: BarChart3 },
        { path: '/reportes/mensual', name: 'Mensual', icon: BarChart3 },
        { path: '/reportes/anual', name: 'Anual', icon: BarChart3 }
      ]
    },
    {
      path: ROUTES.CONFIGURACION,
      name: 'Configuración',
      icon: Settings,
      submenu: [
        { path: ROUTES.CONFIGURACION_JORNADAS, name: 'Jornadas', icon: Clock },
        { path: ROUTES.CONFIGURACION_FERIADOS, name: 'Feriados', icon: Calendar },
        { path: ROUTES.CONFIGURACION_TIPOS_HE, name: 'Tipos de HE', icon: Calculator }
      ]
    }
  ];

  const [openSubmenu, setOpenSubmenu] = React.useState(null);

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <div className={`
      h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white
      flex flex-col transition-all duration-300
      ${isOpen ? 'w-64' : 'w-20'}
    `}>
      {/* Logo */}
      <div className={`
        h-16 flex items-center justify-between px-4 border-b border-gray-700
        ${!isOpen && 'justify-center'}
      `}>
        {isOpen ? (
          <>
            <span className="text-xl font-bold text-white">HE System</span>
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item, index) => (
            <li key={item.path}>
              {item.submenu ? (
                // Item con submenú
                <div>
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`
                      w-full flex items-center px-3 py-2 rounded-lg
                      hover:bg-gray-700 transition-colors
                      ${!isOpen && 'justify-center'}
                    `}
                    title={!isOpen ? item.name : ''}
                  >
                    <item.icon size={20} />
                    {isOpen && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.name}</span>
                        <ChevronRight
                          size={16}
                          className={`transform transition-transform ${
                            openSubmenu === index ? 'rotate-90' : ''
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenú */}
                  {isOpen && openSubmenu === index && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <NavLink
                            to={subItem.path}
                            onClick={onMobileClose}
                            className={({ isActive }) => `
                              flex items-center px-3 py-2 rounded-lg text-sm
                              transition-colors
                              ${isActive 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }
                            `}
                          >
                            <subItem.icon size={16} />
                            <span className="ml-3">{subItem.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Item simple
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2 rounded-lg transition-colors
                    ${!isOpen && 'justify-center'}
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                  title={!isOpen ? item.name : ''}
                >
                  <item.icon size={20} />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Versión */}
      {isOpen && (
        <div className="p-4 text-xs text-gray-400 border-t border-gray-700">
          <p>Versión 1.0.0</p>
          <p className="mt-1">© 2026 Hartemania</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;