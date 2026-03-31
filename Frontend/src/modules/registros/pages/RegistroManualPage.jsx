import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useRegistroForm } from '../hooks/useRegistroForm';
import RegistroManualForm from '../components/RegistroManualForm';
import { Button, Card, Spinner, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// PÁGINA DE REGISTRO MANUAL
// ============================================

const RegistroManualPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUIStore();
  
  // Obtener ID de la URL si es edición
  const queryParams = new URLSearchParams(location.search);
  const registroId = queryParams.get('id');
  const isEditing = !!registroId;

  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { guardarRegistro, cargarRegistro } = useRegistroForm();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    if (isEditing) {
      cargarDatosRegistro();
    }
  }, [registroId]);

  const cargarDatosRegistro = async () => {
    setLoading(true);
    try {
      const data = await cargarRegistro(registroId);
      setRegistro(data);
    } catch (err) {
      setError(err.message);
      showToast({
        type: 'error',
        message: 'Error al cargar el registro'
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLERS
  // ========================================
  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await guardarRegistro(data, registroId);
      
      showToast({
        type: 'success',
        message: isEditing 
          ? 'Registro actualizado correctamente' 
          : 'Registro creado correctamente'
      });

      navigate('/registros');
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Error al guardar el registro'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/registros');
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[30px] border border-slate-200 bg-gradient-to-r from-white via-white to-amber-50 px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              icon={ArrowLeft}
              className="w-full sm:w-auto"
            >
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Registro Manual' : 'Nuevo Registro Manual'}
              </h1>
              <p className="text-gray-500 mt-1">
                {isEditing 
                  ? 'Modifica los datos del registro de asistencia'
                  : 'Registra manualmente la entrada y salida de un empleado'
                }
              </p>
            </div>
          </div>

          <div className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Registro manual supervisado
          </div>
        </div>
      </div>

      {/* Contenido */}
      <Card className="rounded-[30px] border border-slate-200 shadow-sm">
        {loading && isEditing ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" text="Cargando registro..." />
          </div>
        ) : error ? (
          <Alert
            type="error"
            title="Error"
            message={error}
          />
        ) : (
          <RegistroManualForm
            initialData={registro}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            isEditing={isEditing}
          />
        )}
      </Card>

      {/* Información adicional */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <Clock className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Los registros manuales se marcan con un ícono especial 
              para diferenciarlos de las importaciones automáticas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroManualPage;