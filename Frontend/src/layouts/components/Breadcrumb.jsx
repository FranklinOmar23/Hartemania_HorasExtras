import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// ============================================
// COMPONENTE BREADCRUMB
// Migas de pan para navegación
// ============================================

const Breadcrumb = () => {
  const location = useLocation();

  // ========================================
  // GENERAR RUTAS
  // ========================================
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(path => path);
    
    const breadcrumbs = paths.map((path, index) => {
      const url = '/' + paths.slice(0, index + 1).join('/');
      
      // Formatear nombre
      let name = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Reemplazar nombres comunes
      const nameMap = {
        'empleados': 'Empleados',
        'importacion': 'Importación',
        'registros': 'Registros',
        'calculos': 'Cálculos',
        'reportes': 'Reportes',
        'configuracion': 'Configuración',
        'nuevo': 'Nuevo',
        'editar': 'Editar',
        'detalle': 'Detalle',
        'manual': 'Manual',
        'jornadas': 'Jornadas',
        'feriados': 'Feriados',
        'tipos-he': 'Tipos de HE'
      };

      name = nameMap[path.toLowerCase()] || name;

      return { name, url };
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Home */}
        <li>
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-500"
          >
            <Home size={16} />
          </Link>
        </li>

        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.url} className="flex items-center">
            <ChevronRight size={14} className="text-gray-400 mx-1" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-gray-700">
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.url}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;