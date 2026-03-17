import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Card, Badge, Button, Spinner } from '../../../components/common';
import { formatearFecha } from '../../../utils';

// ============================================
// COMPONENTE ULTIMAS IMPORTACIONES
// Lista de las últimas importaciones de Excel
// ============================================

const UltimasImportaciones = ({ importaciones = [], loading, onVerTodas }) => {
  const navigate = useNavigate();

  // ========================================
  // CONFIGURACIÓN DE ESTADOS
  // ========================================
  const getEstadoConfig = (estado) => {
    const estados = {
      PENDIENTE: {
        label: 'Pendiente',
        icon: Clock,
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-500'
      },
      PROCESADO: {
        label: 'Procesado',
        icon: CheckCircle,
        color: 'bg-green-100',
        textColor: 'text-green-800',
        iconColor: 'text-green-500'
      },
      ERROR: {
        label: 'Error',
        icon: AlertCircle,
        color: 'bg-red-100',
        textColor: 'text-red-800',
        iconColor: 'text-red-500'
      }
    };
    return estados[estado] || estados.PENDIENTE;
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <Card 
      title="Últimas Importaciones" 
      subtitle="Archivos Excel importados recientemente"
      headerAction={
        <Button variant="ghost" size="sm" onClick={onVerTodas}>
          Ver todas <ChevronRight size={16} className="ml-1" />
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : importaciones.length === 0 ? (
        <div className="text-center py-8">
          <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">No hay importaciones recientes</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/importacion')}
          >
            Importar archivo
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {importaciones.map((imp, index) => {
            const estado = getEstadoConfig(imp.estado);
            const EstadoIcon = estado.icon;

            return (
              <div
                key={imp.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/importacion/${imp.id}`)}
              >
                {/* Icono de archivo */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                {/* Información */}
                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {imp.nombreArchivo}
                    </p>
                    <Badge 
                      variant={
                        imp.estado === 'PROCESADO' ? 'success' :
                        imp.estado === 'ERROR' ? 'danger' : 'warning'
                      }
                      size="sm"
                      icon={EstadoIcon}
                    >
                      {estado.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{formatearFecha(imp.fecha)}</span>
                      <span className="mx-2">•</span>
                      <span>{imp.totalRegistros} registros</span>
                      {imp.registrosError > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-red-500">
                            {imp.registrosError} errores
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {imp.usuario}
                    </p>
                  </div>
                </div>

                {/* Flecha */}
                <ChevronRight size={18} className="text-gray-400 ml-2" />
              </div>
            );
          })}

          {/* Resumen de importaciones */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-semibold text-blue-600">
                  {importaciones.length}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Procesadas</p>
                <p className="text-lg font-semibold text-green-600">
                  {importaciones.filter(i => i.estado === 'PROCESADO').length}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Pendientes</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {importaciones.filter(i => i.estado === 'PENDIENTE').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UltimasImportaciones;