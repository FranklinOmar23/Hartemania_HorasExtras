import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// STORE DE UI
// Maneja el estado de la interfaz de usuario
// ============================================
const useUIStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // ESTADO - TEMA
      // ========================================
      theme: 'light',
      sidebarOpen: true,
      sidebarMobileOpen: false,
      
      // ========================================
      // ESTADO - MODALES
      // ========================================
      modales: {
        confirmar: {
          isOpen: false,
          titulo: '',
          mensaje: '',
          onConfirm: null,
          onCancel: null,
          tipo: 'info'
        },
        empleadoForm: {
          isOpen: false,
          modo: 'crear',
          empleadoId: null,
          data: null
        },
        registroManual: {
          isOpen: false,
          fecha: null,
          empleadoId: null
        },
        importacionPreview: {
          isOpen: false,
          datos: null,
          archivo: null
        },
        reportePreview: {
          isOpen: false,
          datos: null,
          tipo: null
        }
      },

      // ========================================
      // ESTADO - NOTIFICACIONES (TOASTS)
      // ========================================
      toasts: [],
      notificaciones: [],
      notificacionesNoLeidas: 0,

      // ========================================
      // ESTADO - LOADING
      // ========================================
      loadingGlobal: false,
      loadingComponents: {},

      // ========================================
      // ESTADO - BREADCRUMBS
      // ========================================
      breadcrumbs: [],

      // ========================================
      // ESTADO - PREFERENCIAS
      // ========================================
      preferencias: {
        itemsPorPagina: 20,
        formatoFecha: 'DD/MM/YYYY',
        formatoHora: 'HH:mm',
        moneda: 'RD$',
        sonidosActivados: true,
        notificacionesActivadas: true
      },

      // ========================================
      // ACTIONS - TEMA
      // ========================================
      setTheme: (theme) => {
        set({ theme });
        
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      toggleSidebarMobile: () => {
        set(state => ({ sidebarMobileOpen: !state.sidebarMobileOpen }));
      },

      closeSidebarMobile: () => {
        set({ sidebarMobileOpen: false });
      },

      // ========================================
      // ACTIONS - TOASTS (SHOWTOAST)
      // ========================================
      showToast: ({ type = 'info', title, message, duration = 3000 }) => {
        const id = Date.now();
        const toast = {
          id,
          type,
          title,
          message,
          duration
        };
        
        set(state => ({
          toasts: [...state.toasts, toast]
        }));
        
        // Auto-remover después de la duración
        setTimeout(() => {
          set(state => ({
            toasts: state.toasts.filter(t => t.id !== id)
          }));
        }, duration);
        
        return id;
      },

      removeToast: (id) => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      },

      // ========================================
      // ACTIONS - MODALES
      // ========================================
      openConfirmModal: (config) => {
        set({
          modales: {
            ...get().modales,
            confirmar: {
              isOpen: true,
              titulo: config.titulo || 'Confirmar acción',
              mensaje: config.mensaje || '¿Está seguro?',
              onConfirm: config.onConfirm || null,
              onCancel: config.onCancel || null,
              tipo: config.tipo || 'info'
            }
          }
        });
      },

      closeConfirmModal: () => {
        set({
          modales: {
            ...get().modales,
            confirmar: {
              isOpen: false,
              titulo: '',
              mensaje: '',
              onConfirm: null,
              onCancel: null,
              tipo: 'info'
            }
          }
        });
      },

      openEmpleadoModal: (modo, empleadoId = null, data = null) => {
        set({
          modales: {
            ...get().modales,
            empleadoForm: {
              isOpen: true,
              modo,
              empleadoId,
              data
            }
          }
        });
      },

      closeEmpleadoModal: () => {
        set({
          modales: {
            ...get().modales,
            empleadoForm: {
              isOpen: false,
              modo: 'crear',
              empleadoId: null,
              data: null
            }
          }
        });
      },

      openRegistroManualModal: (fecha = null, empleadoId = null) => {
        set({
          modales: {
            ...get().modales,
            registroManual: {
              isOpen: true,
              fecha: fecha || new Date(),
              empleadoId
            }
          }
        });
      },

      closeRegistroManualModal: () => {
        set({
          modales: {
            ...get().modales,
            registroManual: {
              isOpen: false,
              fecha: null,
              empleadoId: null
            }
          }
        });
      },

      openImportacionPreviewModal: (datos, archivo) => {
        set({
          modales: {
            ...get().modales,
            importacionPreview: {
              isOpen: true,
              datos,
              archivo
            }
          }
        });
      },

      closeImportacionPreviewModal: () => {
        set({
          modales: {
            ...get().modales,
            importacionPreview: {
              isOpen: false,
              datos: null,
              archivo: null
            }
          }
        });
      },

      // ========================================
      // ACTIONS - LOADING
      // ========================================
      setLoadingGlobal: (loading) => {
        set({ loadingGlobal: loading });
      },

      setComponentLoading: (componentId, loading) => {
        set(state => ({
          loadingComponents: {
            ...state.loadingComponents,
            [componentId]: loading
          }
        }));
      },

      // ========================================
      // ACTIONS - NOTIFICACIONES
      // ========================================
      addNotificacion: (notificacion) => {
        const nuevaNotificacion = {
          id: Date.now(),
          leida: false,
          fecha: new Date(),
          ...notificacion
        };

        set(state => ({
          notificaciones: [nuevaNotificacion, ...state.notificaciones].slice(0, 50),
          notificacionesNoLeidas: state.notificacionesNoLeidas + 1
        }));
      },

      marcarNotificacionLeida: (id) => {
        set(state => {
          const notificaciones = state.notificaciones.map(notif =>
            notif.id === id ? { ...notif, leida: true } : notif
          );
          
          const noLeidas = notificaciones.filter(n => !n.leida).length;
          
          return {
            notificaciones,
            notificacionesNoLeidas: noLeidas
          };
        });
      },

      marcarTodasLeidas: () => {
        set(state => ({
          notificaciones: state.notificaciones.map(notif => ({ ...notif, leida: true })),
          notificacionesNoLeidas: 0
        }));
      },

      eliminarNotificacion: (id) => {
        set(state => {
          const notificaciones = state.notificaciones.filter(n => n.id !== id);
          const noLeidas = notificaciones.filter(n => !n.leida).length;
          
          return {
            notificaciones,
            notificacionesNoLeidas: noLeidas
          };
        });
      },

      // ========================================
      // ACTIONS - BREADCRUMBS
      // ========================================
      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs });
      },

      addBreadcrumb: (breadcrumb) => {
        set(state => ({
          breadcrumbs: [...state.breadcrumbs, breadcrumb]
        }));
      },

      // ========================================
      // ACTIONS - PREFERENCIAS
      // ========================================
      updatePreferencias: (nuevasPreferencias) => {
        set(state => ({
          preferencias: {
            ...state.preferencias,
            ...nuevasPreferencias
          }
        }));
      },

      // ========================================
      // ACTIONS - UTILIDADES
      // ========================================
      resetUIStore: () => {
        set({
          theme: 'light',
          sidebarOpen: true,
          sidebarMobileOpen: false,
          toasts: [],
          modales: {
            confirmar: {
              isOpen: false,
              titulo: '',
              mensaje: '',
              onConfirm: null,
              onCancel: null,
              tipo: 'info'
            },
            empleadoForm: {
              isOpen: false,
              modo: 'crear',
              empleadoId: null,
              data: null
            },
            registroManual: {
              isOpen: false,
              fecha: null,
              empleadoId: null
            },
            importacionPreview: {
              isOpen: false,
              datos: null,
              archivo: null
            },
            reportePreview: {
              isOpen: false,
              datos: null,
              tipo: null
            }
          },
          notificaciones: [],
          notificacionesNoLeidas: 0,
          loadingGlobal: false,
          loadingComponents: {},
          breadcrumbs: [],
          preferencias: {
            itemsPorPagina: 20,
            formatoFecha: 'DD/MM/YYYY',
            formatoHora: 'HH:mm',
            moneda: 'RD$',
            sonidosActivados: true,
            notificacionesActivadas: true
          }
        });
      },

      // ========================================
      // GETTERS
      // ========================================
      getCurrentTheme: () => {
        const { theme } = get();
        return theme;
      },

      isModalOpen: (modalName) => {
        return get().modales[modalName]?.isOpen || false;
      },

      getComponentLoading: (componentId) => {
        return get().loadingComponents[componentId] || false;
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        preferencias: state.preferencias,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
);

export default useUIStore;