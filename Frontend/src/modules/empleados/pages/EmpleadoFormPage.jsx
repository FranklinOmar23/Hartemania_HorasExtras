import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useEmpleadoForm } from '../hooks/useEmpleadoForm';
import EmpleadoForm from '../components/EmpleadoForm';
import { Button, Card, Spinner, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// PÁGINA DE FORMULARIO DE EMPLEADO (CREAR/EDITAR)
// ============================================

const EmpleadoFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const isEditing = !!id;

  const {
    empleado,
    loading,
    error,
    guardando,
    fetchEmpleado,
    guardarEmpleado
  } = useEmpleadoForm(id);

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    if (isEditing) {
      fetchEmpleado();
    }
  }, [isEditing]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleSubmit = async (data) => {
    try {
      const result = await guardarEmpleado(data);
      
      showToast({
        type: 'success',
        message: isEditing 
          ? 'Empleado actualizado correctamente' 
          : 'Empleado creado correctamente'
      });

      // Redirigir a la lista o al detalle
      if (!isEditing && result?.id) {
        navigate(`/empleados/${result.id}`);
      } else {
        navigate('/empleados');
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Error al guardar empleado'
      });
    }
  };

  const handleCancel = () => {
    navigate('/empleados');
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={handleCancel}
          icon={ArrowLeft}
        >
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing 
              ? 'Modifica los datos del empleado'
              : 'Completa el formulario para registrar un nuevo empleado'
            }
          </p>
        </div>
      </div>

      {/* Contenido */}
      <Card>
        {loading && isEditing ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" text="Cargando datos del empleado..." />
          </div>
        ) : error ? (
          <Alert
            type="error"
            title="Error"
            message={error}
          />
        ) : (
          <EmpleadoForm
            initialData={empleado}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={guardando}
            isEditing={isEditing}
          />
        )}
      </Card>

      {/* Botón de guardado flotante para móvil */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          variant="primary"
          size="lg"
          onClick={() => document.querySelector('form').requestSubmit()}
          icon={Save}
          className="shadow-lg rounded-full w-14 h-14 p-0"
        >
          <span className="sr-only">Guardar</span>
        </Button>
      </div>
    </div>
  );
};

export default EmpleadoFormPage;