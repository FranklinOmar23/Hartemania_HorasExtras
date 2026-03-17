import React, { useState } from 'react';

// ============================================
// COMPONENTE TABS
// Pestañas para organizar contenido
// ============================================

const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline', // underline, pills, buttons
  size = 'md', // sm, md, lg
  fullWidth = false,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  contentClassName = ''
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);

  // Usar prop activeTab si se proporciona, si no usar estado interno
  const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab;

  // ========================================
  // HANDLERS
  // ========================================
  const handleTabClick = (tabId) => {
    if (onChange) {
      onChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  // ========================================
  // VARIANTES DE ESTILOS
  // ========================================
  const getTabStyles = (tabId) => {
    const isActive = currentActiveTab === tabId;
    
    // Estilos base
    const baseStyles = {
      container: 'font-medium transition-all duration-200 cursor-pointer whitespace-nowrap',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      }
    };

    // Variante underline
    if (variant === 'underline') {
      return {
        container: `${baseStyles.container} ${baseStyles.sizes[size]} ${
          isActive
            ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
            : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
        } ${tabClassName} ${isActive ? activeTabClassName : ''}`
      };
    }

    // Variante pills
    if (variant === 'pills') {
      return {
        container: `${baseStyles.container} ${baseStyles.sizes[size]} rounded-lg ${
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-100'
        } ${tabClassName} ${isActive ? activeTabClassName : ''}`
      };
    }

    // Variante buttons
    if (variant === 'buttons') {
      return {
        container: `${baseStyles.container} ${baseStyles.sizes[size]} border ${
          isActive
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        } first:rounded-l-lg last:rounded-r-lg ${tabClassName} ${isActive ? activeTabClassName : ''}`
      };
    }

    return { container: '' };
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={className}>
      {/* Tabs navigation */}
      <div className={`
        flex ${fullWidth ? 'w-full' : 'inline-flex'} 
        ${variant === 'buttons' ? 'space-x-0' : 'space-x-2'}
        ${variant === 'underline' ? 'border-b border-gray-200' : ''}
        overflow-x-auto scrollbar-hide
      `}>
        {tabs.map((tab) => {
          const styles = getTabStyles(tab.id);
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                ${styles.container}
                ${fullWidth ? 'flex-1' : ''}
                flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              disabled={tab.disabled}
              title={tab.title}
            >
              {Icon && (
                <Icon className={`
                  ${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'}
                  ${tab.iconPosition === 'right' ? 'ml-2 order-1' : 'mr-2'}
                `} />
              )}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`
                  ml-2 px-2 py-0.5 text-xs rounded-full
                  ${currentActiveTab === tab.id 
                    ? variant === 'pills' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            ${currentActiveTab === tab.id ? 'block' : 'hidden'}
            ${contentClassName}
          `}
        >
          {tab.content || (typeof tab.children === 'function' 
            ? tab.children() 
            : tab.children
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================
// SUBCOMPONENTES PARA USO MÁS SENCILLO
// ============================================

export const TabPanel = ({ children, active, className }) => (
  <div className={`${active ? 'block' : 'hidden'} ${className || ''}`}>
    {children}
  </div>
);

// ============================================
// EJEMPLO DE USO
// ============================================
/*
import Tabs from './Tabs';
import { Users, Settings, Clock } from 'lucide-react';

const MiComponente = () => {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    {
      id: 'info',
      label: 'Información',
      icon: Users,
      content: <div>Contenido de información</div>
    },
    {
      id: 'config',
      label: 'Configuración',
      icon: Settings,
      badge: 3,
      content: <div>Contenido de configuración</div>
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: Clock,
      disabled: true,
      content: <div>Contenido de historial</div>
    }
  ];

  return (
    <Tabs 
      tabs={tabs} 
      activeTab={activeTab}
      onChange={setActiveTab}
      variant="pills"
    />
  );
};
*/

export default Tabs;