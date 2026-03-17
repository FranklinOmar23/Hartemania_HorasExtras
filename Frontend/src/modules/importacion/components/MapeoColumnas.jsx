import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Select, Alert } from '../../../components/common';

// ============================================
// COMPONENTE MAPEO COLUMNAS
// Mapeo de columnas del Excel a campos del sistema
// ============================================

const MapeoColumnas = ({ columnas = [], onMapeoChange }) => {
  const [mapeo, setMapeo] = useState({});
  const [errores, setErrores] = useState([]);

  // ========================================
  // CAMPOS REQUERIDOS DEL SISTEMA
  // ========================================
  const camposRequeridos = [
    { id: 'fecha', label: 'Fecha', required: true },
    { id: 'codigo', label: 'Código Empleado', required: true },
    { id: 'nombre', label: 'Nombre Empleado', required: true },
    { id: 'horaEntrada', label: 'Hora Entrada', required: false },
    { id: 'horaSalida', label: 'Hora Salida', required: false },
    { id: 'he35', label: 'HE 35%', required: false },
    { id: 'he100', label: 'HE 100%', required: false },
    { id: 'he15', label: 'HE 15%', required: false },
    { id: 'heFeriado', label: 'HE Feriado', required: false },
    { id: 'comentarios', label: 'Comentarios', required: false }
  ];

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    // Detección automática de columnas
    const autoMapeo = {};
    
    columnas.forEach(col => {
      const colLower = col.toLowerCase();
      
      if (colLower.includes('fecha') || colLower.includes('date')) {
        autoMapeo.fecha = col;
      } else if (colLower.includes('código') || colLower.includes('codigo') || colLower.includes('code')) {
        autoMapeo.codigo = col;
      } else if (colLower.includes('nombre') || colLower.includes('name')) {
        autoMapeo.nombre = col;
      } else if (colLower.includes('entrada') || colLower.includes('in')) {
        autoMapeo.horaEntrada = col;
      } else if (colLower.includes('salida') || colLower.includes('out')) {
        autoMapeo.horaSalida = col;
      } else if (colLower.includes('35') || colLower.includes('35%')) {
        autoMapeo.he35 = col;
      } else if (colLower.includes('100') || colLower.includes('100%')) {
        autoMapeo.he100 = col;
      } else if (colLower.includes('15') || colLower.includes('15%')) {
        autoMapeo.he15 = col;
      } else if (colLower.includes('feriado') || colLower.includes('holiday')) {
        autoMapeo.heFeriado = col;
      } else if (colLower.includes('comentario') || colLower.includes('comment')) {
        autoMapeo.comentarios = col;
      }
    });

    setMapeo(autoMapeo);
    validarMapeo(autoMapeo);
  }, [columnas]);

  // ========================================
  // FUNCIONES
  // ========================================
  const handleMapeoChange = (campoId, valor) => {
    const nuevoMapeo = {
      ...mapeo,
      [campoId]: valor
    };
    
    // Si selecciona "No mapear", eliminar del mapeo
    if (!valor) {
      delete nuevoMapeo[campoId];
    }
    
    setMapeo(nuevoMapeo);
    validarMapeo(nuevoMapeo);
    onMapeoChange(nuevoMapeo);
  };

  const validarMapeo = (mapeoActual) => {
    const nuevosErrores = [];
    
    camposRequeridos
      .filter(c => c.required)
      .forEach(campo => {
        if (!mapeoActual[campo.id]) {
          nuevosErrores.push(`El campo "${campo.label}" es requerido`);
        }
      });
    
    // Verificar columnas duplicadas
    const valores = Object.values(mapeoActual);
    const duplicados = valores.filter((v, i) => valores.indexOf(v) !== i);
    if (duplicados.length > 0) {
      nuevosErrores.push(`No se puede mapear múltiples campos a la misma columna`);
    }
    
    setErrores(nuevosErrores);
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Instrucciones:</strong> Selecciona la columna del Excel que corresponde a cada campo del sistema.
          Los campos marcados con <span className="text-red-500">*</span> son requeridos.
        </p>
      </div>

      {/* Tabla de mapeo */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Campo del Sistema
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Columna del Excel
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {camposRequeridos.map(campo => (
              <tr key={campo.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">
                      {campo.label}
                    </span>
                    {campo.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={mapeo[campo.id] || ''}
                    onChange={(e) => handleMapeoChange(campo.id, e.target.value)}
                    options={[
                      { value: '', label: '— No mapear —' },
                      ...columnas.map(col => ({ value: col, label: col }))
                    ]}
                    className="w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Errores de validación */}
      {errores.length > 0 && (
        <Alert
          type="error"
          title="Errores de mapeo"
        >
          <ul className="list-disc list-inside space-y-1 mt-2">
            {errores.map((error, idx) => (
              <li key={idx} className="text-sm">{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Resumen de mapeo */}
      {Object.keys(mapeo).length > 0 && errores.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Mapeo válido
              </p>
              <p className="text-xs text-green-600 mt-1">
                {Object.keys(mapeo).length} campos mapeados correctamente
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapeoColumnas;