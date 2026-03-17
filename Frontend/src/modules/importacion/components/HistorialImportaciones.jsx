import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Download,
  Search
} from 'lucide-react';
import { Table, Badge, Button, Input, Pagination } from '../../../components/common';
import { useImportacion } from '../hooks/useImportacion';
import { formatearFecha } from '../../../utils';

// ============================================
// COMPONENTE HISTORIAL IMPORTACIONES
// Lista de importaciones realizadas
// ============================================

const HistorialImportaciones = ({ onVerDetalle }) => {
  const navigate = useNavigate();
  const { historial, loading, obtenerHistorial } = useImportacion();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    obtenerHistorial();
  }, []);

  // ========================================
  // FILTRADO
  // ========================================
  const filteredData = historial.filter(item =>
    item.nombreArchivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.usuario?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================================
  // PAGINACIÓN
  // ========================================
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // ========================================
  // CONFIGURACIÓN DE ESTADOS
  // ========================================
  const getEstadoConfig = (estado) => {
    const estados = {
      PENDIENTE: {
        label: 'Pendiente',
        icon: Clock,
        variant: 'warning'
      },
      PROCESADO: {
        label: 'Procesado',
        icon: CheckCircle,
        variant: 'success'
      },
      ERROR: {
        label: 'Error',
        icon: AlertCircle,
        variant: 'danger'
      }
    };
    return estados[estado] || estados.PENDIENTE;
  };

  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value) => formatearFecha(value)
    },
    {
      key: 'nombreArchivo',
      label: 'Archivo',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'totalRegistros',
      label: 'Registros',
      render: (value, row) => (
        <div className="flex space-x-2 text-xs">
          <span className="text-green-600">{row.registrosValidos || 0} válidos</span>
          {row.registrosError > 0 && (
            <span className="text-red-600">{row.registrosError} errores</span>
          )}
        </div>
      )
    },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (value) => value || 'Sistema'
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => {
        const config = getEstadoConfig(value);
        return (
          <Badge variant={config.variant} size="sm" icon={config.icon}>
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'acciones',
      label: '',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onVerDetalle(row.id)}
          icon={Eye}
        >
          Ver
        </Button>
      )
    }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex justify-between items-center">
        <div className="w-64">
          <Input
            placeholder="Buscar por archivo o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredData.length} importaciones
        </div>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        data={currentData}
        loading={loading}
        emptyMessage="No hay importaciones en el historial"
      />

      {/* Paginación */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Resumen */}
      {filteredData.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-medium text-gray-900">
                {filteredData.filter(i => i.estado === 'PROCESADO').length}
              </p>
              <p>Procesadas</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {filteredData.filter(i => i.estado === 'PENDIENTE').length}
              </p>
              <p>Pendientes</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {filteredData.reduce((sum, i) => sum + (i.totalRegistros || 0), 0)}
              </p>
              <p>Total registros</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialImportaciones;