import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign,
  Clock,
  Briefcase,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useEmpleados } from '../hooks/useEmpleados';
import { Button, Card, Badge, Spinner, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';
import { formatearMoneda, formatearFecha } from '../../../utils';

// ============================================
// PÁGINA DE DETALLE DE EMPLEADO
// ============================================

const EmpleadoDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, openConfirmModal } = useUIStore();
  
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const { obtenerEmpleadoPorId, eliminarEmpleado, obtenerEstadisticas } = useEmpleados();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [empData, statsData] = await Promise.all([
        obtenerEmpleadoPorId(id),
        obtenerEstadisticas(id)
      ]);
      setEmpleado(empData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar datos del empleado'
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLERS
  // ========================================
  const handleEditar = () => {
    navigate(`/empleados/editar/${id}`);
  };

  const handleEliminar = () => {
    openConfirmModal({
      title: 'Eliminar empleado',
      message: `¿Estás seguro de eliminar a ${empleado.nombre} ${empleado.apellido}?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await eliminarEmpleado(id);
          showToast({
            type: 'success',
            message: 'Empleado eliminado correctamente'
          });
          navigate('/empleados');
        } catch (error) {
          showToast({
            type: 'error',
            message: 'Error al eliminar empleado'
          });
        }
      }
    });
  };

  const handleVerHistorial = () => {
    navigate(`/registros?empleado=${id}`);
  };

  // ========================================
  // RENDER DE SECCIONES
  // ========================================
  const renderInfoPersonal = () => (
    <Card title="Información Personal">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Nombre completo</p>
          <p className="text-lg font-medium text-gray-900">
            {empleado.nombre} {empleado.apellido}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Código</p>
          <p className="text-lg font-medium text-gray-900">{empleado.codigo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Posición</p>
          <div className="flex items-center">
            <Briefcase size={16} className="text-gray-400 mr-2" />
            <p className="text-gray-900">{empleado.posicion || 'No especificado'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Departamento</p>
          <p className="text-gray-900">{empleado.departamento || 'No especificado'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Estado</p>
          <Badge variant={empleado.activo ? 'success' : 'danger'}>
            {empleado.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Fecha de ingreso</p>
          <div className="flex items-center">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <p className="text-gray-900">{formatearFecha(empleado.fechaIngreso)}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderInfoContacto = () => (
    <Card title="Información de Contacto">
      <div className="space-y-4">
        {empleado.email && (
          <div className="flex items-center">
            <Mail size={16} className="text-gray-400 mr-3" />
            <span className="text-gray-900">{empleado.email}</span>
          </div>
        )}
        {empleado.telefono && (
          <div className="flex items-center">
            <Phone size={16} className="text-gray-400 mr-3" />
            <span className="text-gray-900">{empleado.telefono}</span>
          </div>
        )}
        {empleado.direccion && (
          <div className="flex items-center">
            <MapPin size={16} className="text-gray-400 mr-3" />
            <span className="text-gray-900">{empleado.direccion}</span>
          </div>
        )}
        {!empleado.email && !empleado.telefono && !empleado.direccion && (
          <p className="text-gray-500 text-center py-4">
            No hay información de contacto disponible
          </p>
        )}
      </div>
    </Card>
  );

  const renderInfoLaboral = () => (
    <Card title="Información Laboral">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Salario Base</p>
          <div className="flex items-center">
            <DollarSign size={16} className="text-gray-400 mr-1" />
            <p className="text-2xl font-bold text-gray-900">
              {formatearMoneda(empleado.salarioBase)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Valor por Hora</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatearMoneda(empleado.salarioBase / 23.83 / 8)}
          </p>
        </div>
      </div>
    </Card>
  );

  const renderEstadisticas = () => {
    if (!stats) return null;

    return (
      <Card title="Estadísticas de Horas Extras">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Este mes</p>
            <p className="text-2xl font-bold text-blue-700">
              {stats.horasMes} hrs
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Este trimestre</p>
            <p className="text-2xl font-bold text-green-700">
              {stats.horasTrimestre} hrs
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Total acumulado</p>
            <p className="text-2xl font-bold text-purple-700">
              {stats.horasTotal} hrs
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 mb-1">Total pagado</p>
            <p className="text-2xl font-bold text-yellow-700">
              {formatearMoneda(stats.totalPagado)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={handleVerHistorial}>
            Ver historial completo
          </Button>
        </div>
      </Card>
    );
  };

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" text="Cargando datos del empleado..." />
      </div>
    );
  }

  if (error || !empleado) {
    return (
      <Alert
        type="error"
        title="Error"
        message={error || 'Empleado no encontrado'}
        className="mb-6"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/empleados')}
            icon={ArrowLeft}
            className="w-full sm:w-auto"
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {empleado.nombre} {empleado.apellido}
            </h1>
            <p className="text-gray-500 mt-1">
              {empleado.posicion} • Código: {empleado.codigo}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            onClick={handleEditar}
            icon={Edit}
            className="w-full sm:w-auto"
          >
            Editar
          </Button>
          <Button
            variant="danger"
            onClick={handleEliminar}
            icon={Trash2}
            className="w-full sm:w-auto"
          >
            Eliminar
          </Button>
        </div>
      </div>

      {/* Contenido en grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Columna izquierda (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {renderInfoPersonal()}
          {renderEstadisticas()}
        </div>

        {/* Columna derecha (1/3) */}
        <div className="space-y-6">
          {renderInfoLaboral()}
          {renderInfoContacto()}
        </div>
      </div>
    </div>
  );
};

export default EmpleadoDetallePage;