import * as XLSX from 'xlsx';

// ============================================
// FUNCIONES PARA MANEJO DE ARCHIVOS EXCEL
// ============================================

/**
 * Lee un archivo Excel y lo convierte a JSON
 * @param {File} file - Archivo Excel a leer
 * @returns {Promise<Object>} Datos del Excel
 */
export const leerExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Obtener todas las hojas
        const hojas = {};
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          hojas[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        });
        
        resolve({
          nombre: file.name,
          size: file.size,
          hojas: workbook.SheetNames,
          datos: hojas,
          workbook
        });
      } catch (error) {
        reject(new Error('Error al leer el archivo Excel'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extrae los registros de asistencia del Excel
 * @param {Object} excelData - Datos del Excel
 * @returns {Array} Registros de asistencia
 */
export const extraerRegistrosAsistencia = (excelData) => {
  const registros = [];
  const hojaReporte = excelData.datos['Reporte Diario'] || excelData.datos['REPORTE DIARIO'];
  
  if (!hojaReporte) {
    throw new Error('No se encontró la hoja "Reporte Diario"');
  }
  
  // Buscar la fila de encabezados
  let headerRow = -1;
  for (let i = 0; i < hojaReporte.length; i++) {
    const fila = hojaReporte[i];
    if (fila && fila[0] === 'FECHA' && fila[1] === 'Codigo') {
      headerRow = i;
      break;
    }
  }
  
  if (headerRow === -1) {
    throw new Error('No se encontró la estructura esperada en el Excel');
  }
  
  let fechaActual = null;
  
  // Procesar cada fila
  for (let i = headerRow + 1; i < hojaReporte.length; i++) {
    const fila = hojaReporte[i];
    if (!fila || fila.length < 5) continue;
    
    // Detectar nueva fecha
    if (fila[0] && typeof fila[0] === 'string' && fila[0].includes('202')) {
      fechaActual = fila[0].split(' ')[0]; // Tomar solo YYYY-MM-DD
    }
    
    // Si tiene código y nombre
    if (fila[1] && fila[2]) {
      const registro = {
        fila: i + 1,
        fecha: fechaActual,
        codigo: fila[1]?.toString().trim(),
        nombre: fila[2]?.toString().trim(),
        horaEntrada: fila[3] === '--' ? null : fila[3],
        horaSalida: fila[4] === '--' ? null : fila[4],
        he35: parseFloat(fila[5]) || 0,
        he100: parseFloat(fila[6]) || 0,
        he15: parseFloat(fila[7]) || 0,
        heFeriado: parseFloat(fila[8]) || 0,
        comentarios: fila[9]?.toString().trim() || null
      };
      
      // Solo agregar si tiene datos relevantes
      if (registro.codigo && registro.fecha) {
        registros.push(registro);
      }
    }
  }
  
  return registros;
};

/**
 * Extrae los empleados del Excel (desde hoja de cálculo)
 * @param {Object} excelData - Datos del Excel
 * @returns {Array} Lista de empleados
 */
export const extraerEmpleados = (excelData) => {
  const empleados = [];
  const hojaCalculo = excelData.datos['Calculo Horas Extras'];
  
  if (!hojaCalculo) return empleados;
  
  // Buscar fila de encabezados
  let headerRow = -1;
  for (let i = 0; i < hojaCalculo.length; i++) {
    const fila = hojaCalculo[i];
    if (fila && fila[0] === 'NO' && fila[1] === 'CODIGO') {
      headerRow = i;
      break;
    }
  }
  
  if (headerRow === -1) return empleados;
  
  // Procesar empleados
  for (let i = headerRow + 1; i < hojaCalculo.length; i++) {
    const fila = hojaCalculo[i];
    if (!fila || !fila[1]) continue;
    
    const empleado = {
      codigo: fila[1]?.toString().trim(),
      nombre: fila[2]?.toString().trim(),
      posicion: fila[3]?.toString().trim(),
      salario: parseFloat(fila[4]) || 0
    };
    
    if (empleado.codigo && empleado.nombre) {
      empleados.push(empleado);
    }
  }
  
  return empleados;
};

/**
 * Valida la estructura del Excel
 * @param {Object} excelData - Datos del Excel
 * @returns {Object} Resultado de la validación
 */
export const validarExcel = (excelData) => {
  const errores = [];
  const advertencias = [];
  
  // Verificar hojas requeridas
  const hojasRequeridas = ['Reporte Diario', 'Calculo Horas Extras'];
  hojasRequeridas.forEach(hoja => {
    if (!excelData.datos[hoja]) {
      advertencias.push(`No se encontró la hoja "${hoja}"`);
    }
  });
  
  // Verificar registros
  try {
    const registros = extraerRegistrosAsistencia(excelData);
    if (registros.length === 0) {
      errores.push('No se encontraron registros de asistencia');
    }
    
    // Validar fechas
    const fechasInvalidas = registros.filter(r => !r.fecha);
    if (fechasInvalidas.length > 0) {
      advertencias.push(`${fechasInvalidas.length} registros sin fecha válida`);
    }
    
    // Validar horas
    const horasInvalidas = registros.filter(r => 
      (r.horaEntrada && !validarHoraExcel(r.horaEntrada)) ||
      (r.horaSalida && !validarHoraExcel(r.horaSalida))
    );
    if (horasInvalidas.length > 0) {
      advertencias.push(`${horasInvalidas.length} registros con formato de hora inválido`);
    }
    
  } catch (error) {
    errores.push('Error al procesar los registros: ' + error.message);
  }
  
  return {
    valido: errores.length === 0,
    errores,
    advertencias,
    totalRegistros: registros?.length || 0
  };
};

/**
 * Valida formato de hora en Excel
 * @param {string} hora - Hora a validar
 * @returns {boolean} True si es válida
 */
const validarHoraExcel = (hora) => {
  if (!hora || hora === '--') return true;
  
  // Formato HH:MM o HH:MM:SS
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  return regex.test(hora);
};

/**
 * Convierte número de Excel a fecha
 * @param {number} excelDate - Número de fecha de Excel
 * @returns {Date} Objeto Date
 */
export const excelDateToJSDate = (excelDate) => {
  if (!excelDate) return null;
  // Excel date offset: 25569 = 1970-01-01
  return new Date((excelDate - 25569) * 86400 * 1000);
};

/**
 * Genera un Excel con los resultados
 * @param {Array} data - Datos a exportar
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Blob} Blob del archivo Excel
 */
export const generarExcel = (data, sheetName = 'Resultados') => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/octet-stream' });
};

/**
 * Genera Excel en el mismo formato que usan actualmente
 * @param {Object} resumen - Datos del resumen quincenal
 * @returns {Blob} Blob del archivo Excel
 */
export const generarExcelFormatoHartemania = (resumen) => {
  const wb = XLSX.utils.book_new();
  
  // Hoja de cálculo
  const calculoData = [
    ['FORMULARIO DE HORAS EXTRAS', '', '', '', '', '', '', 'TOTAL EN HORAS', '', '', 'TOTALES VALOR EN RD$', '', '', ''],
    ['NO', 'CODIGO', 'NOMBRE', 'POSICION', 'SALARIO', 'SALARIO DIARIO', 'SALARIO POR HORA', 
     'HORAS EXTRAS 35%', 'HORAS EXTRAS 100%', 'HORAS EXTRAS NOCTURNAS 15%', 'HORAS EXTRAS FERIADAS',
     'HORAS EXTRAS 35%', 'HORAS EXTRAS 100%', 'HORAS EXTRAS NOCTURNAS 15%', 'HORAS EXTRAS FERIADAS', 'TOTAL A PAGAR'],
    ...resumen.empleados.map((emp, idx) => [
      idx + 1,
      emp.codigo,
      emp.nombre,
      emp.posicion,
      emp.salario,
      (emp.salario / 23.83).toFixed(2),
      ((emp.salario / 23.83) / 8).toFixed(2),
      emp.horas35,
      emp.horas100,
      emp.horas15,
      emp.horasFeriado,
      emp.monto35,
      emp.monto100,
      emp.monto15,
      emp.montoFeriado,
      emp.totalPagar
    ])
  ];
  
  const wsCalculo = XLSX.utils.aoa_to_sheet(calculoData);
  XLSX.utils.book_append_sheet(wb, wsCalculo, 'Calculo Horas Extras');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/octet-stream' });
};