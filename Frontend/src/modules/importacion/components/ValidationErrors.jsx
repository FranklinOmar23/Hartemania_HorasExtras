import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Alert, Button } from '../../../components/common';

// ============================================
// COMPONENTE VALIDATION ERRORS
// Muestra errores de validación del Excel
// ============================================

const ValidationErrors = ({ errors = [], onClose }) => {
  const [expanded, setExpanded] = React.useState({});

  if (!errors || errors.length === 0) return null;

  // ========================================
  // AGRUPAR ERRORES POR TIPO
  // ========================================
  const erroresPorTipo = errors.reduce((acc, error) => {
    const tipo = error.tipo || 'general';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(error);
    return acc;
  }, {});

  // ========================================
  // TOGGLE EXPANSIÓN
  // ========================================
  const toggleExpand = (index) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Errores de validación ({errors.length})
          </h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} icon={X}>
            Cerrar
          </Button>
        )}
      </div>

      {/* Lista de errores */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.entries(erroresPorTipo).map(([tipo, erroresTipo]) => (
          <div key={tipo} className="bg-red-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              {tipo === 'formato' ? 'Errores de formato' :
               tipo === 'requerido' ? 'Campos requeridos' :
               tipo === 'duplicado' ? 'Registros duplicados' :
               tipo === 'rango' ? 'Valores fuera de rango' :
               'Errores generales'} ({erroresTipo.length})
            </h4>
            
            <div className="space-y-2">
              {erroresTipo.map((error, idx) => (
                <div key={idx} className="bg-white rounded p-3 text-sm">
                  <div className="flex items-start">
                    <span className="font-mono text-xs bg-red-100 text-red-800 px-2 py-1 rounded mr-3">
                      Fila {error.fila}
                    </span>
                    <div className="flex-1">
                      <p className="text-red-700">{error.mensaje}</p>
                      {error.detalle && (
                        <button
                          onClick={() => toggleExpand(`${tipo}-${idx}`)}
                          className="text-xs text-red-500 hover:text-red-700 mt-1"
                        >
                          {expanded[`${tipo}-${idx}`] ? 'Ver menos' : 'Ver detalle'}
                        </button>
                      )}
                      {expanded[`${tipo}-${idx}`] && error.detalle && (
                        <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(error.detalle, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Acciones sugeridas */}
      <Alert type="warning" className="mt-4">
        <p className="text-sm">
          <strong>Sugerencia:</strong> Corrige los errores en tu archivo Excel y vuelve a importar.
          Puedes usar la vista previa para verificar los datos antes de importar.
        </p>
      </Alert>
    </div>
  );
};

export default ValidationErrors;