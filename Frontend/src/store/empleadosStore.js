import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { empleadosService } from '../services';

// ============================================
// STORE DE EMPLEADOS
// ============================================
const useEmpleadosStore = create(
  persist(
    (set, get) => ({
      // Estado
      empleados: [],
      empleadoActual: null,
      loading: false,
      error: null,
      filtros: {
        search: '',
        departamento: '',
        activo: true,
        pagina: 1,
        limite: 20,
        totalPaginas: 1,
        totalRegistros: 0
      },
      seleccionados: [],
      ultimaActualizacion: null,

      // Acciones
      fetchEmpleados: async (filtrosAdicionales = {}) => {
        set({ loading: true, error: null });
        try {
          const filtros = { ...get().filtros, ...filtrosAdicionales };
          const response = await empleadosService.obtenerTodos(filtros);
          
          set({ 
            empleados: response.data || [],
            filtros: {
              ...filtros,
              totalPaginas: response.totalPaginas || 1,
              totalRegistros: response.total || 0
            },
            loading: false,
            ultimaActualizacion: new Date().toLocaleString()
          });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      fetchEmpleadoById: async (id) => {
        set({ loading: true, error: null });
        try {
          const empleado = await empleadosService.obtenerPorId(id);
          set({ empleadoActual: empleado, loading: false });
          return empleado;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      crearEmpleado: async (empleadoData) => {
        set({ loading: true, error: null });
        try {
          const nuevoEmpleado = await empleadosService.crear(empleadoData);
          set(state => ({
            empleados: [nuevoEmpleado, ...state.empleados],
            loading: false,
            ultimaActualizacion: new Date().toLocaleString()
          }));
          return nuevoEmpleado;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      actualizarEmpleado: async (id, empleadoData) => {
        set({ loading: true, error: null });
        try {
          const empleadoActualizado = await empleadosService.actualizar(id, empleadoData);
          set(state => ({
            empleados: state.empleados.map(emp => emp.id === id ? empleadoActualizado : emp),
            empleadoActual: empleadoActualizado,
            loading: false,
            ultimaActualizacion: new Date().toLocaleString()
          }));
          return empleadoActualizado;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      eliminarEmpleado: async (id) => {
        set({ loading: true, error: null });
        try {
          await empleadosService.eliminar(id);
          set(state => ({
            empleados: state.empleados.filter(emp => emp.id !== id),
            seleccionados: state.seleccionados.filter(selId => selId !== id),
            loading: false,
            ultimaActualizacion: new Date().toLocaleString()
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      seleccionarEmpleado: (id) => {
        set(state => ({
          seleccionados: [...state.seleccionados, id]
        }));
      },

      deseleccionarEmpleado: (id) => {
        set(state => ({
          seleccionados: state.seleccionados.filter(selId => selId !== id)
        }));
      },

      toggleSeleccion: (id) => {
        set(state => {
          if (state.seleccionados.includes(id)) {
            return {
              seleccionados: state.seleccionados.filter(selId => selId !== id)
            };
          } else {
            return {
              seleccionados: [...state.seleccionados, id]
            };
          }
        });
      },

      seleccionarTodos: () => {
        set(state => ({
          seleccionados: state.empleados.map(emp => emp.id)
        }));
      },

      deseleccionarTodos: () => {
        set({ seleccionados: [] });
      },

      setFiltros: (nuevosFiltros) => {
        set(state => ({
          filtros: { ...state.filtros, ...nuevosFiltros }
        }));
      },

      limpiarError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'empleados-storage',
      partialize: (state) => ({
        filtros: state.filtros,
        ultimaActualizacion: state.ultimaActualizacion
      })
    }
  )
);

export default useEmpleadosStore;