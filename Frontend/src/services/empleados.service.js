import { get, post, put, del } from './api';

const BASE_URL = '/empleados';
const REPORTES_URL = '/reportes';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getQuarterStart = () => {
  const now = new Date();
  const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
  return new Date(now.getFullYear(), quarterMonth, 1);
};

const normalizarPaginacion = (response) => {
  const payload = response.data;
  const pagination = payload.pagination || {};

  return {
    data: payload.data || [],
    total: pagination.total || payload.total || 0,
    totalPaginas: pagination.pages || payload.totalPaginas || 1,
    pagina: pagination.page || payload.pagina || 1,
    hasNext: pagination.hasNext || false
  };
};

export const empleadosService = {
  obtenerTodos: async (filtros = {}) => {
    const response = await get(BASE_URL, filtros);
    return normalizarPaginacion(response);
  },

  obtenerTodosActivos: async () => {
    const response = await get(`${BASE_URL}/todos`);
    return response.data.data || response.data || [];
  },

  obtenerPorId: async (id) => {
    const response = await get(`${BASE_URL}/${id}`);
    return response.data.data || response.data;
  },

  obtenerPorCodigo: async (codigo) => {
    const response = await get(`${BASE_URL}/codigo/${codigo}`);
    return response.data.data || response.data;
  },

  crear: async (empleadoData) => {
    const response = await post(BASE_URL, empleadoData);
    return response.data.data || response.data;
  },

  actualizar: async (id, empleadoData) => {
    const response = await put(`${BASE_URL}/${id}`, empleadoData);
    return response.data.data || response.data;
  },

  eliminar: async (id) => {
    const response = await del(`${BASE_URL}/${id}`);
    return response.data;
  },

  buscar: async (termino, filtros = {}) => {
    const response = await get(`${BASE_URL}/buscar`, {
      q: termino,
      ...filtros
    });

    return {
      data: response.data.data || response.data || [],
      total: response.data.pagination?.total || response.data.total || 0
    };
  },

  obtenerEstadisticas: async (id) => {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const inicioTrimestre = getQuarterStart();
    const inicioHistorico = new Date(2020, 0, 1);
    const fechaFin = formatDate(now);

    const [reporteMes, reporteTrimestre, reporteHistorico] = await Promise.all([
      get(`${REPORTES_URL}/empleado/${id}`, {
        fechaInicio: formatDate(inicioMes),
        fechaFin,
        formato: 'json'
      }),
      get(`${REPORTES_URL}/empleado/${id}`, {
        fechaInicio: formatDate(inicioTrimestre),
        fechaFin,
        formato: 'json'
      }),
      get(`${REPORTES_URL}/empleado/${id}`, {
        fechaInicio: formatDate(inicioHistorico),
        fechaFin,
        formato: 'json'
      })
    ]);

    const datosMes = reporteMes.data.data || reporteMes.data || {};
    const datosTrimestre = reporteTrimestre.data.data || reporteTrimestre.data || {};
    const datosHistorico = reporteHistorico.data.data || reporteHistorico.data || {};

    return {
      horasMes: Number(datosMes.totales?.totalHoras || 0).toFixed(2),
      horasTrimestre: Number(datosTrimestre.totales?.totalHoras || 0).toFixed(2),
      horasTotal: Number(datosHistorico.totales?.totalHoras || 0).toFixed(2),
      totalPagado: Number(datosHistorico.totales?.totalPagar || 0)
    };
  }
};

export default empleadosService;