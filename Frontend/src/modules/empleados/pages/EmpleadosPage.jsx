import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, RefreshCw } from 'lucide-react';
import { useEmpleados } from '../hooks/useEmpleados';
import EmpleadoTable from '../components/EmpleadoTable';
import EmpleadoFilter from '../components/EmpleadoFilter';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Button, Card, Alert, Spinner } from '../../../components/common';
import { useUIStore } from '../../../store';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ============================================
// PÁGINA PRINCIPAL DE EMPLEADOS (LISTA)
// ============================================

const EmpleadosPage = () => {
  const navigate = useNavigate();
  const { showToast, openConfirmModal } = useUIStore();
  
  // Estado local
  const [selectedEmpleados, setSelectedEmpleados] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState(null);
  const [exportando, setExportando] = useState(false);

  // Hook personalizado
  const {
    empleados,
    loading,
    error,
    filtros,
    paginacion,
    fetchEmpleados,
    setFiltros,
    cambiarPagina,
    eliminarEmpleado,
    eliminarMultiples
  } = useEmpleados();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    cargarEmpleados();
  }, [filtros, paginacion.currentPage]);

  // ========================================
  // FUNCIONES
  // ========================================
  const cargarEmpleados = async () => {
    try {
      await fetchEmpleados({
        ...filtros,
        pagina: paginacion.currentPage,
        limite: paginacion.pageSize
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar empleados'
      });
    }
  };

  const handleNuevoEmpleado = () => {
    navigate('/empleados/nuevo');
  };

  const handleEditar = (id) => {
    navigate(`/empleados/editar/${id}`);
  };

  const handleVerDetalle = (id) => {
    navigate(`/empleados/${id}`);
  };

  const handleEliminar = (empleado) => {
    setEmpleadoToDelete(empleado);
    setDeleteModalOpen(true);
  };

  const handleEliminarMultiple = () => {
    if (selectedEmpleados.length === 0) {
      showToast({
        type: 'warning',
        message: 'Selecciona al menos un empleado'
      });
      return;
    }

    openConfirmModal({
      title: 'Eliminar empleados',
      message: `¿Estás seguro de eliminar ${selectedEmpleados.length} empleado(s)?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await eliminarMultiples(selectedEmpleados);
          setSelectedEmpleados([]);
          showToast({
            type: 'success',
            message: `${selectedEmpleados.length} empleado(s) eliminado(s)`
          });
        } catch (error) {
          showToast({
            type: 'error',
            message: 'Error al eliminar empleados'
          });
        }
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!empleadoToDelete) return;
    
    try {
      await eliminarEmpleado(empleadoToDelete.id);
      setDeleteModalOpen(false);
      setEmpleadoToDelete(null);
      showToast({
        type: 'success',
        message: 'Empleado eliminado correctamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al eliminar empleado'
      });
    }
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      // Crear workbook
      const wb = XLSX.utils.book_new();
      
      // Preparar datos
      const exportData = empleados.map(emp => ({
        Código: emp.codigo,
        Nombre: emp.nombre,
        Apellido: emp.apellido,
        'Nombre Completo': `${emp.nombre} ${emp.apellido}`,
        Posición: emp.posicion,
        Departamento: emp.departamento,
        'Salario Base': emp.salarioBase,
        'Fecha Ingreso': emp.fechaIngreso,
        Estado: emp.activo ? 'Activo' : 'Inactivo'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
      
      // Guardar archivo
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `empleados_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showToast({
        type: 'success',
        message: 'Empleados exportados correctamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al exportar empleados'
      });
    } finally {
      setExportando(false);
    }
  };

  const handleRefresh = () => {
    cargarEmpleados();
    showToast({
      type: 'info',
      message: 'Datos actualizados'
    });
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-500 mt-1">
            Gestiona el catálogo de empleados de la empresa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportar}
            loading={exportando}
            icon={Download}
          >
            Exportar
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            icon={RefreshCw}
          >
            Actualizar
          </Button>
          {selectedEmpleados.length > 0 && (
            <Button
              variant="danger"
              onClick={handleEliminarMultiple}
              icon={Upload}
            >
              Eliminar ({selectedEmpleados.length})
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNuevoEmpleado}
            icon={Plus}
          >
            Nuevo Empleado
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <EmpleadoFilter
          filtros={filtros}
          onChange={setFiltros}
          onSearch={cargarEmpleados}
        />
      </Card>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Cargando empleados..." />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert
          type="error"
          title="Error al cargar empleados"
          message={error}
          dismissible
        />
      )}

      {/* Tabla de empleados */}
      {!loading && !error && (
        <Card>
          <EmpleadoTable
            empleados={empleados}
            loading={loading}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            onVerDetalle={handleVerDetalle}
            selectedEmpleados={selectedEmpleados}
            onSelectionChange={setSelectedEmpleados}
            paginacion={paginacion}
            onPageChange={cambiarPagina}
          />
        </Card>
      )}

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        empleado={empleadoToDelete}
        loading={loading}
      />
    </div>
  );
};

export default EmpleadosPage;