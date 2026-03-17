import React from 'react';

// ============================================
// COMPONENTE FOOTER
// Pie de página
// ============================================

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div>
          © {currentYear} Hartemania. Todos los derechos reservados.
        </div>
        
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a
            href="#"
            className="hover:text-gray-700 transition-colors"
          >
            Términos y condiciones
          </a>
          <span>•</span>
          <a
            href="#"
            className="hover:text-gray-700 transition-colors"
          >
            Política de privacidad
          </a>
          <span>•</span>
          <a
            href="#"
            className="hover:text-gray-700 transition-colors"
          >
            Soporte
          </a>
        </div>

        <div className="mt-2 md:mt-0">
          Versión 1.0.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;