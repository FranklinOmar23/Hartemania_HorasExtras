import { get, post, put, del } from './api';
import { DIAS_SEMANA, TIPOS_HORAS_EXTRAS } from '../config/constants';

const BASE_URL = '/configuracion';
const STORAGE_KEYS = {
  jornadas: 'hartemania_config_jornadas',
  feriados: 'hartemania_config_feriados',
  tiposHE: 'hartemania_config_tipos_he'
};

const buildJornadasDefault = () => DIAS_SEMANA.map((dia) => ({
  id: dia.id + 1,
  diaSemana: dia.id,
  diaNombre: dia.nombre,
  horaEntrada: dia.id === 0 ? '' : dia.id === 6 ? '09:00' : '08:30',
  horaSalida: dia.id === 0 ? '' : dia.id === 6 ? '13:00' : '17:30',
  horasBase: dia.id === 0 ? 0 : dia.id === 6 ? 4 : 8,
  aplicaHorasExtras: dia.id !== 0,
  porcentajeExtra: dia.id === 0 ? 0 : dia.id === 6 ? 100 : 35,
  activo: true
}));

const buildFeriadosDefault = () => {
  const anioActual = new Date().getFullYear();
  return [
    { id: 1, nombre: 'Ano Nuevo', dia: 1, mes: 1, anio: null, esFijo: true, aplicaPorcentaje100: true, activo: true },
    { id: 2, nombre: 'Dia de la Independencia', dia: 27, mes: 2, anio: null, esFijo: true, aplicaPorcentaje100: true, activo: true },
    { id: 3, nombre: 'Viernes Santo', dia: 18, mes: 4, anio: anioActual, esFijo: false, aplicaPorcentaje100: true, activo: true },
    { id: 4, nombre: 'Dia de la Restauracion', dia: 16, mes: 8, anio: null, esFijo: true, aplicaPorcentaje100: true, activo: true },
    { id: 5, nombre: 'Navidad', dia: 25, mes: 12, anio: null, esFijo: true, aplicaPorcentaje100: true, activo: true }
  ];
};

const buildTiposDefault = () => Object.values(TIPOS_HORAS_EXTRAS).map((tipo, index) => ({
  id: tipo.id || index + 1,
  codigo: tipo.codigo,
  nombre: tipo.nombre,
  descripcion: tipo.descripcion,
  porcentaje: tipo.porcentaje,
  factorMultiplicador: tipo.factor,
  colorHex: tipo.color,
  orden: index + 1,
  aplicaFinSemana: tipo.codigo === '100%',
  aplicaFeriados: tipo.codigo === '100%' || tipo.codigo === 'FERIADO',
  aplicaNocturno: tipo.codigo === '15%',
  activo: true
}));

const defaults = {
  jornadas: buildJornadasDefault,
  feriados: buildFeriadosDefault,
  tiposHE: buildTiposDefault
};

const readLocalCollection = (key, fallbackFactory) => {
  const stored = window.localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }

  const initial = fallbackFactory();
  window.localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const writeLocalCollection = (key, data) => {
  window.localStorage.setItem(key, JSON.stringify(data));
  return data;
};

const upsertLocalItem = (key, item, fallbackFactory) => {
  const collection = readLocalCollection(key, fallbackFactory);
  const nextId = collection.length > 0 ? Math.max(...collection.map((entry) => entry.id)) + 1 : 1;
  const nuevo = { ...item, id: nextId };
  writeLocalCollection(key, [...collection, nuevo]);
  return nuevo;
};

const updateLocalItem = (key, id, item, fallbackFactory) => {
  const collection = readLocalCollection(key, fallbackFactory);
  const updated = collection.map((entry) => (entry.id === id ? { ...entry, ...item, id } : entry));
  writeLocalCollection(key, updated);
  return updated.find((entry) => entry.id === id) || null;
};

const deleteLocalItem = (key, id, fallbackFactory) => {
  const collection = readLocalCollection(key, fallbackFactory);
  writeLocalCollection(key, collection.filter((entry) => entry.id !== id));
  return { success: true };
};

const normalizeTipo = (tipo) => ({
  ...tipo,
  nombre: tipo.nombre || tipo.descripcion || tipo.codigo,
  descripcion: tipo.descripcion || tipo.nombre || ''
});

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (error.response?.status === 404 || error.mensajeUsuario === 'No se pudo conectar con el servidor') {
      return fallback();
    }
    throw error;
  }
};

export const configuracionService = {
  jornadas: {
    obtenerTodas: async () => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/jornadas`);
        return response.data.data || response.data;
      },
      () => readLocalCollection(STORAGE_KEYS.jornadas, defaults.jornadas)
    ),

    obtenerPorId: async (id) => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/jornadas/${id}`);
        return response.data.data || response.data;
      },
      () => readLocalCollection(STORAGE_KEYS.jornadas, defaults.jornadas).find((item) => item.id === Number(id)) || null
    ),

    crear: async (jornadaData) => withFallback(
      async () => {
        const response = await post(`${BASE_URL}/jornadas`, jornadaData);
        return response.data.data || response.data;
      },
      () => upsertLocalItem(STORAGE_KEYS.jornadas, jornadaData, defaults.jornadas)
    ),

    actualizar: async (id, jornadaData) => withFallback(
      async () => {
        const response = await put(`${BASE_URL}/jornadas/${id}`, jornadaData);
        return response.data.data || response.data;
      },
      () => updateLocalItem(STORAGE_KEYS.jornadas, Number(id), jornadaData, defaults.jornadas)
    ),

    eliminar: async (id) => withFallback(
      async () => {
        const response = await del(`${BASE_URL}/jornadas/${id}`);
        return response.data;
      },
      () => deleteLocalItem(STORAGE_KEYS.jornadas, Number(id), defaults.jornadas)
    ),

    obtenerPorDia: async (diaSemana) => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/jornadas/dia/${diaSemana}`);
        return response.data.data || response.data;
      },
      () => readLocalCollection(STORAGE_KEYS.jornadas, defaults.jornadas).find((item) => item.diaSemana === Number(diaSemana)) || null
    )
  },

  feriados: {
    obtenerTodos: async (anio = null) => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/feriados`, { anio });
        return response.data.data || response.data;
      },
      () => {
        const items = readLocalCollection(STORAGE_KEYS.feriados, defaults.feriados);
        return anio ? items.filter((item) => item.esFijo || item.anio === anio) : items;
      }
    ),

    obtenerPorId: async (id) => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/feriados/${id}`);
        return response.data.data || response.data;
      },
      () => readLocalCollection(STORAGE_KEYS.feriados, defaults.feriados).find((item) => item.id === Number(id)) || null
    ),

    crear: async (feriadoData) => withFallback(
      async () => {
        const response = await post(`${BASE_URL}/feriados`, feriadoData);
        return response.data.data || response.data;
      },
      () => upsertLocalItem(STORAGE_KEYS.feriados, feriadoData, defaults.feriados)
    ),

    actualizar: async (id, feriadoData) => withFallback(
      async () => {
        const response = await put(`${BASE_URL}/feriados/${id}`, feriadoData);
        return response.data.data || response.data;
      },
      () => updateLocalItem(STORAGE_KEYS.feriados, Number(id), feriadoData, defaults.feriados)
    ),

    eliminar: async (id) => withFallback(
      async () => {
        const response = await del(`${BASE_URL}/feriados/${id}`);
        return response.data;
      },
      () => deleteLocalItem(STORAGE_KEYS.feriados, Number(id), defaults.feriados)
    ),

    esFeriado: async (fecha) => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/feriados/verificar`, { fecha });
        return response.data.esFeriado;
      },
      () => {
        const current = new Date(fecha);
        const dia = current.getDate();
        const mes = current.getMonth() + 1;
        const anio = current.getFullYear();
        return readLocalCollection(STORAGE_KEYS.feriados, defaults.feriados).some((item) => {
          if (!item.activo) {
            return false;
          }
          if (item.esFijo) {
            return item.dia === dia && item.mes === mes;
          }
          return item.dia === dia && item.mes === mes && (!item.anio || item.anio === anio);
        });
      }
    )
  },

  tiposHE: {
    obtenerTodos: async () => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/tipos-he`);
        return (response.data.data || response.data || []).map(normalizeTipo);
      },
      () => readLocalCollection(STORAGE_KEYS.tiposHE, defaults.tiposHE).map(normalizeTipo)
    ),

    obtenerPorId: async (id) => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/tipos-he/${id}`);
        return normalizeTipo(response.data.data || response.data);
      },
      () => normalizeTipo(readLocalCollection(STORAGE_KEYS.tiposHE, defaults.tiposHE).find((item) => item.id === Number(id)) || {})
    ),

    crear: async (tipoData) => withFallback(
      async () => {
        const response = await post(`${BASE_URL}/tipos-he`, tipoData);
        return normalizeTipo(response.data.data || response.data);
      },
      () => normalizeTipo(upsertLocalItem(STORAGE_KEYS.tiposHE, tipoData, defaults.tiposHE))
    ),

    actualizar: async (id, tipoData) => withFallback(
      async () => {
        const response = await put(`${BASE_URL}/tipos-he/${id}`, tipoData);
        return normalizeTipo(response.data.data || response.data);
      },
      () => normalizeTipo(updateLocalItem(STORAGE_KEYS.tiposHE, Number(id), tipoData, defaults.tiposHE))
    ),

    eliminar: async (id) => withFallback(
      async () => {
        const response = await del(`${BASE_URL}/tipos-he/${id}`);
        return response.data;
      },
      () => deleteLocalItem(STORAGE_KEYS.tiposHE, Number(id), defaults.tiposHE)
    ),

    obtenerPorCodigo: async (codigo) => withFallback(
      async () => {
        const response = await get(`${BASE_URL}/tipos-he/codigo/${codigo}`);
        return normalizeTipo(response.data.data || response.data);
      },
      () => normalizeTipo(readLocalCollection(STORAGE_KEYS.tiposHE, defaults.tiposHE).find((item) => item.codigo === codigo) || {})
    )
  },

  // ========================================
  // CONFIGURACIÓN GENERAL
  // ========================================
  general: {
    obtener: async () => {
      try {
        const response = await get(`${BASE_URL}/general`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    actualizar: async (configData) => {
      try {
        const response = await put(`${BASE_URL}/general`, configData);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    },

    resetear: async () => {
      try {
        const response = await post(`${BASE_URL}/general/resetear`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // ========================================
  // RESPALDO Y RESTAURACIÓN
  // ========================================
  respaldo: {
    crear: async () => {
      try {
        const response = await post(`${BASE_URL}/respaldo/crear`, {}, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    restaurar: async (archivo) => {
      try {
        const formData = new FormData();
        formData.append('archivo', archivo);

        const response = await post(`${BASE_URL}/respaldo/restaurar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    listar: async () => {
      try {
        const response = await get(`${BASE_URL}/respaldo/listar`);
        return response.data.data || response.data;
      } catch (error) {
        throw error;
      }
    }
  }
};

export default configuracionService;