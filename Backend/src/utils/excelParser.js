// src/utils/excelParser.js
import XLSX from 'xlsx';
import moment from 'moment';

class ExcelParser {
  async parsear(buffer, filename) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      console.log('Primeras 5 filas del Excel:', data.slice(0, 5));

      // Buscar la fila de encabezados
      let headerRow = -1;
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row) continue;
        
        // Buscar encabezados específicos
        const rowStr = (row[0] || '').toString();
        if (rowStr.includes('Nombre completo')) {
          headerRow = i;
          break;
        }
      }

      if (headerRow === -1) {
        throw new Error('No se encontró la fila de encabezados');
      }

      console.log(`✅ Fila de encabezados encontrada en línea ${headerRow + 1}`);

      const registros = [];

      // Procesar desde la fila después de los encabezados
      for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i];
        
        // Verificar que la fila tenga datos
        if (!row || row.length < 6) continue;
        
        const nombre = row[0]?.toString().trim() || '';
        const id = row[1]?.toString().trim() || '';
        const departamento = row[2]?.toString().trim() || '';
        const fecha = row[3] ? this._parseFecha(row[3]) : null;
        const horaEntrada = row[4] ? this._parseHora(row[4]) : null;
        const horaSalida = row[5] ? this._parseHora(row[5]) : null;

        // Saltar filas sin ID o sin nombre
        if (!id || id === '' || id === '--') continue;
        if (!fecha) continue;

        // ✅ AHORA SÍ: crear registro con las horas (aunque sean null)
        registros.push({
          fila: i + 1,
          fecha,
          codigo: id,
          nombre,
          departamento,
          horaEntrada,  // Puede ser null
          horaSalida,   // Puede ser null
        });
      }

      console.log(`✅ Registros extraídos: ${registros.length}`);
      console.log('Primer registro:', registros[0]);

      // Diagnostico: fechas unicas y registros por empleado
      const fechasUnicas = [...new Set(registros.map(r => r.fecha))].sort();
      const porEmpleado = {};
      for (const r of registros) {
        porEmpleado[r.codigo] = (porEmpleado[r.codigo] || 0) + 1;
      }
      console.log(`📅 Fechas unicas en Excel (${fechasUnicas.length}):`, fechasUnicas);
      console.log(`👥 Registros por empleado:`, porEmpleado);
      // Buscar Abraham especificamente
      const abraham = registros.filter(r => r.nombre && r.nombre.includes('ABRAHAM'));
      if (abraham.length > 0) {
        console.log(`🔍 ABRAHAM fechas:`, abraham.map(r => `${r.fecha} ${r.horaEntrada}-${r.horaSalida}`));
      }

      return {
        filename,
        metadatos: { 
          totalRegistros: registros.length,
          columnas: ['Nombre', 'ID', 'Departamento', 'Fecha', 'Entrada', 'Salida']
        },
        registros,
        periodoInicio: this._calcularPeriodo(registros).inicio,
        periodoFin: this._calcularPeriodo(registros).fin,
        totalRegistros: registros.length
      };
    } catch (error) {
      throw new Error(`Error al parsear Excel: ${error.message}`);
    }
  }

  _parseFecha(valor) {
    if (!valor || valor === '--' || valor === '') return null;

    // Si es Date object (por si xlsx devuelve objetos Date)
    if (valor instanceof Date) {
      return moment.utc(valor).format('YYYY-MM-DD');
    }

    // Si es numero de Excel (serial date)
    if (typeof valor === 'number') {
      const ms = (valor - 25569) * 86400 * 1000;
      return moment.utc(ms).format('YYYY-MM-DD');
    }

    // Si es string, probar multiples formatos
    if (typeof valor === 'string') {
      const str = valor.trim();

      // YYYY-MM-DD
      const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

      // DD/MM/YYYY o D/M/YYYY
      const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (dmy) {
        const dia = dmy[1].padStart(2, '0');
        const mes = dmy[2].padStart(2, '0');
        const anio = dmy[3];
        return `${anio}-${mes}-${dia}`;
      }
    }

    return null;
  }

  _parseHora(valor) {
    if (!valor || valor === '--' || valor === '') return null;
    
    // Formato "8:30" o "08:30"
    if (typeof valor === 'string') {
      const match = valor.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        return `${match[1].padStart(2, '0')}:${match[2]}`;
      }
    }
    
    // Si es número de Excel (0.35416667 = 8:30)
    if (typeof valor === 'number') {
      const totalMinutos = Math.round(valor * 24 * 60);
      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    }
    
    return null;
  }

  _calcularPeriodo(registros) {
    if (registros.length === 0) return { inicio: null, fin: null };
    
    const fechas = registros.map(r => r.fecha).filter(Boolean).sort();
    return {
      inicio: fechas[0],
      fin: fechas[fechas.length - 1]
    };
  }
}

export default ExcelParser;