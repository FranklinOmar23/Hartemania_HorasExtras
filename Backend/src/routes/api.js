// src/routes/api.js
import { Router } from 'express';
import empleadosRoutes from './empleados.routes.js';
import importacionRoutes from './importacion.routes.js';
import registrosRoutes from './registros.routes.js';
import calculosRoutes from './calculos.routes.js';
import quincenasRoutes from './quincenas.routes.js';
import reportesRoutes from './reportes.routes.js';
import { getConnection, TYPES } from '../config/database.js';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Bienvenida a la API
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: API funcionando
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Hartemania - Sistema de Horas Extras',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      empleados: '/api/empleados',
      importacion: '/api/importacion',
      registros: '/api/registros',
      calculos: '/api/calculos',
      quincenas: '/api/quincenas',
      reportes: '/api/reportes'
    }
  });
});

// Montar rutas específicas
router.use('/empleados', empleadosRoutes);
router.use('/importacion', importacionRoutes);
router.use('/registros', registrosRoutes);
router.use('/calculos', calculosRoutes);
router.use('/quincenas', quincenasRoutes);
router.use('/reportes', reportesRoutes);

// ============================================
// ENDPOINT DASHBOARD - Resumen general
// GET /api/dashboard?anio=2026&mes=3
// ============================================
router.get('/dashboard', async (req, res) => {
  try {
    const anio = parseInt(req.query.anio) || new Date().getFullYear();
    const mes = parseInt(req.query.mes) || (new Date().getMonth() + 1);

    const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = `${anio}-${String(mes).padStart(2, '0')}-${new Date(anio, mes, 0).getDate()}`;

    const pool = await getConnection();

    // 1) Empleados activos
    const empRes = await pool.request().query(
      "SELECT COUNT(*) as total FROM Empleados WHERE Activo = 1"
    );
    const empleadosActivos = empRes.recordset[0].total;

    // 2) Registros del mes agrupados por fecha
    const regRes = await pool.request()
      .input('FI', TYPES.NVarChar, primerDia)
      .input('FF', TYPES.NVarChar, ultimoDia)
      .query(`
        SELECT 
          CONVERT(VARCHAR(10), Fecha, 23) as fecha,
          COUNT(*) as totalRegistros,
          COUNT(DISTINCT EmpleadoId) as empleados
        FROM RegistrosAsistencia
        WHERE CONVERT(VARCHAR(10), Fecha, 23) BETWEEN @FI AND @FF
        GROUP BY CONVERT(VARCHAR(10), Fecha, 23)
        ORDER BY fecha
      `);
    const registrosPorDia = regRes.recordset;

    // 3) Totales de registros del mes
    const totRegRes = await pool.request()
      .input('FI', TYPES.NVarChar, primerDia)
      .input('FF', TYPES.NVarChar, ultimoDia)
      .query(`
        SELECT 
          COUNT(*) as totalRegistros,
          COUNT(DISTINCT EmpleadoId) as empleadosConRegistros,
          COUNT(DISTINCT CONVERT(VARCHAR(10), Fecha, 23)) as diasConRegistros
        FROM RegistrosAsistencia
        WHERE CONVERT(VARCHAR(10), Fecha, 23) BETWEEN @FI AND @FF
      `);
    const totalesRegistros = totRegRes.recordset[0];

    // 4) Quincenas calculadas (si existen)
    const qRes = await pool.request()
      .input('Anio', TYPES.Int, anio)
      .input('Mes', TYPES.Int, mes)
      .query(`
        SELECT 
          SUM(Horas35) as totalHoras35,
          SUM(Horas100) as totalHoras100,
          SUM(Horas15) as totalHoras15,
          SUM(HorasFeriado) as totalHorasFeriado,
          SUM(TotalHoras) as totalHoras,
          SUM(TotalPagar) as totalPagar,
          COUNT(DISTINCT EmpleadoId) as empleadosConHE
        FROM ResumenQuincenal
        WHERE Anio = @Anio AND Mes = @Mes
      `);
    const quincenasTotales = qRes.recordset[0];

    // 5) Top empleados con mas HE (si hay quincenas)
    let topEmpleados = [];
    if (quincenasTotales.totalHoras > 0) {
      const topRes = await pool.request()
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .query(`
          SELECT TOP 5
            rq.EmpleadoId as id,
            e.Codigo as codigo,
            CONCAT(e.Nombre, ' ', e.Apellido) as nombre,
            e.Posicion as posicion,
            SUM(rq.TotalHoras) as totalHoras,
            SUM(rq.TotalPagar) as totalPagar
          FROM ResumenQuincenal rq
          INNER JOIN Empleados e ON e.Id = rq.EmpleadoId
          WHERE rq.Anio = @Anio AND rq.Mes = @Mes
          GROUP BY rq.EmpleadoId, e.Codigo, e.Nombre, e.Apellido, e.Posicion
          ORDER BY SUM(rq.TotalHoras) DESC
        `);
      topEmpleados = topRes.recordset;
    } else {
      // Si no hay quincenas, top empleados por cantidad de registros
      const topRegRes = await pool.request()
        .input('FI', TYPES.NVarChar, primerDia)
        .input('FF', TYPES.NVarChar, ultimoDia)
        .query(`
          SELECT TOP 5
            ra.EmpleadoId as id,
            e.Codigo as codigo,
            CONCAT(e.Nombre, ' ', e.Apellido) as nombre,
            e.Posicion as posicion,
            COUNT(*) as totalRegistros,
            0 as totalHoras,
            0 as totalPagar
          FROM RegistrosAsistencia ra
          INNER JOIN Empleados e ON e.Id = ra.EmpleadoId
          WHERE CONVERT(VARCHAR(10), ra.Fecha, 23) BETWEEN @FI AND @FF
          GROUP BY ra.EmpleadoId, e.Codigo, e.Nombre, e.Apellido, e.Posicion
          ORDER BY COUNT(*) DESC
        `);
      topEmpleados = topRegRes.recordset;
    }

    // 6) Ultimas importaciones
    const impRes = await pool.request()
      .query(`
        SELECT TOP 5
          Id as id,
          NombreArchivo as nombreArchivo,
          FechaImportacion as fecha,
          TotalRegistros as totalRegistros,
          RegistrosValidos as registrosValidos,
          RegistrosError as registrosError,
          Estado as estado,
          UsuarioImportacion as usuario
        FROM Importaciones
        ORDER BY FechaImportacion DESC
      `);
    const ultimasImportaciones = impRes.recordset;

    // 7) Horas por tipo por dia (si hay quincenas calculadas y detalle)
    let horasPorDia = [];
    if (quincenasTotales.totalHoras > 0) {
      const hpdRes = await pool.request()
        .input('Anio', TYPES.Int, anio)
        .input('Mes', TYPES.Int, mes)
        .query(`
          SELECT
            rq.EmpleadoId,
            rq.Quincena,
            SUM(rq.Horas35) as he35,
            SUM(rq.Horas100) as he100,
            SUM(rq.Horas15) as he15,
            SUM(rq.HorasFeriado) as heFeriado
          FROM ResumenQuincenal rq
          WHERE rq.Anio = @Anio AND rq.Mes = @Mes
          GROUP BY rq.EmpleadoId, rq.Quincena
        `);
      // Agrupar por quincena
      const q1 = { dia: 'Q1 (1-15)', 'HE 35%': 0, 'HE 100%': 0, 'HE 15%': 0, 'Feriado': 0 };
      const q2 = { dia: 'Q2 (16-fin)', 'HE 35%': 0, 'HE 100%': 0, 'HE 15%': 0, 'Feriado': 0 };
      hpdRes.recordset.forEach(r => {
        const target = r.Quincena === 1 ? q1 : q2;
        target['HE 35%'] += r.he35 || 0;
        target['HE 100%'] += r.he100 || 0;
        target['HE 15%'] += r.he15 || 0;
        target['Feriado'] += r.heFeriado || 0;
      });
      horasPorDia = [q1, q2];
    }

    res.json({
      success: true,
      data: {
        resumen: {
          empleadosActivos,
          totalRegistros: totalesRegistros.totalRegistros,
          empleadosConRegistros: totalesRegistros.empleadosConRegistros,
          diasConRegistros: totalesRegistros.diasConRegistros,
          // Datos de quincenas calculadas
          totalHoras: quincenasTotales.totalHoras || 0,
          totalPagar: quincenasTotales.totalPagar || 0,
          empleadosConHE: quincenasTotales.empleadosConHE || 0,
          tieneQuincenas: (quincenasTotales.totalHoras || 0) > 0,
          horasPorTipo: {
            he35: quincenasTotales.totalHoras35 || 0,
            he100: quincenasTotales.totalHoras100 || 0,
            he15: quincenasTotales.totalHoras15 || 0,
            feriado: quincenasTotales.totalHorasFeriado || 0
          }
        },
        registrosPorDia,
        horasPorDia,
        topEmpleados,
        ultimasImportaciones
      }
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;