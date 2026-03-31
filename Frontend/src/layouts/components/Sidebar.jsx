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
        { path: '/reportes?tab=quincenal', name: 'Quincenal', icon: BarChart3 },
        { path: '/reportes?tab=empleado', name: 'Por empleado', icon: Users },
        { path: '/reportes?tab=comparativo', name: 'Comparativo', icon: BarChart3 }
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
      h-full border-r border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#111827_48%,#0f172a_100%)] text-white shadow-2xl shadow-slate-950/20
      flex flex-col transition-all duration-300
      ${isOpen ? 'w-64' : 'w-20'}
    `}>
      {/* Logo */}
      <div className={`
        flex h-16 items-center justify-between border-b border-white/10 px-4
        ${!isOpen && 'justify-center'}
      `}>
        {isOpen ? (
          <>
            <div>
              <span className="text-xl font-bold text-white">Hartemania</span>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Overtime</p>
            </div>
            <button
              onClick={onToggle}
              className="rounded-xl border border-white/10 bg-white/5 p-1 transition-colors hover:bg-white/10"
            >
              <ChevronLeft size={20} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="rounded-xl border border-white/10 bg-white/5 p-1 transition-colors hover:bg-white/10"
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
                      w-full flex items-center rounded-2xl px-3 py-2 transition-colors
                      hover:bg-white/10
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
                                ? 'bg-gradient-to-r from-amber-400 to-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/20' 
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
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
                    flex items-center rounded-2xl px-3 py-2 transition-colors
                    ${!isOpen && 'justify-center'}
                    ${isActive 
                      ? 'bg-gradient-to-r from-amber-400 to-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/20' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
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
        <div className="border-t border-white/10 p-4 text-xs text-slate-400">
          <p>Versión 1.0.0</p>
          <p className="mt-1">© 2026 Hartemania</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;