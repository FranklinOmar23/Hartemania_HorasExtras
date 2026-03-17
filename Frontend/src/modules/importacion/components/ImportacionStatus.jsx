import React from 'react';
import { CheckCircle, AlertCircle, Clock, ArrowRight, Download } from 'lucide-react';
import { Button, Card, Badge } from '../../../components/common';
import { formatearFecha, formatearHora } from '../../../utils';

// ============================================
// COMPONENTE IMPORTACION STATUS
// Muestra el resultado de la importación
// ============================================

const ImportacionStatus = ({ resultado, onVerDetalle, onNuevaImportacion }) => {
  if (!resultado) return null;

  const exitoso = resultado.registrosError === 0;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Icono de estado */}
      <div className="text-center">
        <div className={`inline-flex p-4 rounded-full ${
          exitoso ? 'bg-green-100' : 'bg-yellow-100'
        } mb-4`}>
          {exitoso ? (
            <CheckCircle className="h-12 w-12 text-green-600" />
          ) : (
            <AlertCircle className="h-12 w-12 text-yellow-600" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {exitoso ? '¡Importación exitosa!' : 'Importación completada con advertencias'}
        </h2>
        
        <p className="text-gray-500">
          {resultado.mensaje || `Se procesaron ${resultado.totalRegistros} registros`}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">
            {resultado.totalRegistros || 0}
          </p>
          <p className="text-sm text-gray-500">Total registros</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">
            {resultado.registrosValidos || 0}
          </p>
          <p className="text-sm text-green-600">Válidos</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-600">
            {resultado.registrosError || 0}
          </p>
          <p className="text-sm text-red-600">Con error</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600">
            {resultado.duplicados || 0}
          </p>
          <p className="text-sm text-blue-600">Duplicados</p>
        </div>
      </div>

      {/* Detalles por tipo de hora */}
      {resultado.resumenHoras && (
        <Card title="Resumen de horas extras">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">HE 35%</p>
              <p className="text-xl font-bold text-blue-600">
                {resultado.resumenHoras.he35?.toFixed(2) || '0'} hrs
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">HE 100%</p>
              <p className="text-xl font-bold text-green-600">
                {resultado.resumenHoras.he100?.toFixed(2) || '0'} hrs
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">HE 15%</p>
              <p className="text-xl font-bold text-yellow-600">
                {resultado.resumenHoras.he15?.toFixed(2) || '0'} hrs
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">HE Feriado</p>
              <p className="text-xl font-bold text-red-600">
                {resultado.resumenHoras.feriado?.toFixed(2) || '0'} hrs
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Errores si los hay */}
      {resultado.errores && resultado.errores.length > 0 && (
        <Card title="Errores encontrados">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {resultado.errores.slice(0, 10).map((error, idx) => (
              <div key={idx} className="bg-red-50 p-3 rounded text-sm">
                <span className="font-mono text-xs bg-red-200 text-red-800 px-2 py-1 rounded mr-2">
                  Fila {error.fila}
                </span>
                {error.mensaje}
              </div>
            ))}
            {resultado.errores.length > 10 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                ... y {resultado.errores.length - 10} errores más
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Botones de acción */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button
          variant="outline"
          onClick={onNuevaImportacion}
        >
          Nueva importación
        </Button>
        
        {resultado.id && (
          <Button
            variant="primary"
            onClick={() => onVerDetalle(resultado.id)}
            icon={ArrowRight}
          >
            Ver detalles
          </Button>
        )}
      </div>

      {/* Información adicional */}
      <div className="text-center text-xs text-gray-400 mt-4">
        <p>ID de importación: {resultado.id}</p>
        <p>Procesado el {formatearFecha(resultado.fecha)} a las {formatearHora(resultado.fecha)}</p>
      </div>
    </div>
  );
};

export default ImportacionStatus;