// ============================================
// CONFIGURACIÓN DE TEMAS
// Colores y estilos para la aplicación
// ============================================

// ============================================
// TEMA CLARO
// ============================================
export const lightTheme = {
  // Colores principales
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  
  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12'
  },
  
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63'
  },

  // Fondos
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    card: '#ffffff',
    modal: '#ffffff',
    sidebar: '#f8fafc',
    navbar: '#ffffff'
  },

  // Textos
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#9ca3af',
    disabled: '#d1d5db',
    inverse: '#ffffff',
    link: '#2563eb'
  },

  // Bordes
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    heavy: '#9ca3af'
  },

  // Sombras
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },

  // Estados
  hover: {
    primary: '#f9fafb',
    secondary: '#f3f4f6'
  },

  // Tablas
  table: {
    header: '#f9fafb',
    row: '#ffffff',
    rowHover: '#f3f4f6',
    stripe: '#f9fafb'
  },

  // Badges
  badge: {
    info: {
      bg: '#dbeafe',
      text: '#1e40af'
    },
    success: {
      bg: '#dcfce7',
      text: '#166534'
    },
    warning: {
      bg: '#fef9c3',
      text: '#854d0e'
    },
    danger: {
      bg: '#fee2e2',
      text: '#b91c1c'
    }
  }
};

// ============================================
// TEMA OSCURO
// ============================================
export const darkTheme = {
  // Colores principales
  primary: {
    50: '#172554',
    100: '#1e3a8a',
    200: '#1e40af',
    300: '#1d4ed8',
    400: '#2563eb',
    500: '#3b82f6',
    600: '#60a5fa',
    700: '#93c5fd',
    800: '#bfdbfe',
    900: '#dbeafe'
  },
  
  secondary: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc'
  },
  
  success: {
    50: '#14532d',
    100: '#166534',
    200: '#15803d',
    300: '#16a34a',
    400: '#22c55e',
    500: '#4ade80',
    600: '#86efac',
    700: '#bbf7d0',
    800: '#dcfce7',
    900: '#f0fdf4'
  },
  
  warning: {
    50: '#713f12',
    100: '#854d0e',
    200: '#a16207',
    300: '#ca8a04',
    400: '#eab308',
    500: '#facc15',
    600: '#fde047',
    700: '#fef08a',
    800: '#fef9c3',
    900: '#fefce8'
  },
  
  danger: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#b91c1c',
    300: '#dc2626',
    400: '#ef4444',
    500: '#f87171',
    600: '#fca5a5',
    700: '#fecaca',
    800: '#fee2e2',
    900: '#fef2f2'
  },
  
  info: {
    50: '#164e63',
    100: '#155e75',
    200: '#0e7490',
    300: '#0891b2',
    400: '#06b6d4',
    500: '#22d3ee',
    600: '#67e8f9',
    700: '#a5f3fc',
    800: '#cffafe',
    900: '#ecfeff'
  },

  // Fondos
  background: {
    primary: '#111827',
    secondary: '#1f2937',
    tertiary: '#374151',
    card: '#1f2937',
    modal: '#1f2937',
    sidebar: '#1f2937',
    navbar: '#111827'
  },

  // Textos
  text: {
    primary: '#f9fafb',
    secondary: '#e5e7eb',
    tertiary: '#9ca3af',
    disabled: '#4b5563',
    inverse: '#111827',
    link: '#60a5fa'
  },

  // Bordes
  border: {
    light: '#374151',
    medium: '#4b5563',
    heavy: '#6b7280'
  },

  // Sombras
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4)'
  },

  // Estados
  hover: {
    primary: '#374151',
    secondary: '#4b5563'
  },

  // Tablas
  table: {
    header: '#1f2937',
    row: '#111827',
    rowHover: '#1f2937',
    stripe: '#1a1f2e'
  },

  // Badges
  badge: {
    info: {
      bg: '#1e3a8a',
      text: '#bfdbfe'
    },
    success: {
      bg: '#166534',
      text: '#bbf7d0'
    },
    warning: {
      bg: '#854d0e',
      text: '#fef08a'
    },
    danger: {
      bg: '#991b1b',
      text: '#fecaca'
    }
  }
};

// ============================================
// CONFIGURACIÓN DE TIPOGRAFÍA
// ============================================
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

// ============================================
// CONFIGURACIÓN DE ESPACIADO
// ============================================
export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem'
};

// ============================================
// CONFIGURACIÓN DE BORDES
// ============================================
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px'
};

// ============================================
// CONFIGURACIÓN DE ANIMACIONES
// ============================================
export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// ============================================
// FUNCIÓN PARA OBTENER EL TEMA SEGÚN MODO
// ============================================
export const getTheme = (mode = 'light') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

// ============================================
// EXPORTACIONES
// ============================================
export default {
  light: lightTheme,
  dark: darkTheme,
  typography,
  spacing,
  borderRadius,
  animation,
  getTheme
};