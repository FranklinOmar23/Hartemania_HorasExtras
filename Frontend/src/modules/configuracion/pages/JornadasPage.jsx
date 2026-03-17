import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Save, X } from 'lucide-react';
import { useJornadas } from '../hooks/useJornadas';
import JornadaForm from '../components/JornadaForm';
import ConfigTable from '../components/ConfigTable';
import { Card, Button, Modal, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// PÁGINA DE CONFIGURACIÓN DE JORNADAS
// ============================================

const JornadasPage = () => {
  const { showToast, openConfirmModal } = useUIStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [jornadaData, setJornadaData] = useState(null);

  const {
    jornadas,
    loading,
    error,
    fetchJornadas,
    crearJornada,
    actualizarJornada,
    eliminarJornada
  } = useJornadas();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    fetchJornadas();
  }, []);

  // ========================================
  // HANDLERS
  // ========================================
  const handleNuevo = () => {
    setEditando(null);
    setJornadaData(null);
    setModalOpen(true);
  };

  const handleEditar = (jornada) => {
    setEditando(jornada);
    setJornadaData(jornada);
    setModalOpen(true);
  };

  const handleEliminar = (jornada) => {
    openConfirmModal({
      title: 'Eliminar jornada',
      message: `¿Estás seguro de eliminar la jornada de ${jornada.diaNombre}?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await eliminarJornada(jornada.id);
          showToast({
            type: 'success',
            message: 'Jornada eliminada correctamente'
          });
        } catch (error) {
          showToast({
            type: 'error',
            message: 'Error al eliminar la jornada'
          });
        }
      }
    });
  };

  const handleGuardar = async (data) => {
    try {
      if (editando) {
        await actualizarJornada(editando.id, data);
        showToast({
          type: 'success',
          message: 'Jornada actualizada correctamente'
        });
      } else {
        await crearJornada(data);
        showToast({
          type: 'success',
          message: 'Jornada creada correctamente'
        });
      }
      setModalOpen(false);
      fetchJornadas();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Error al guardar la jornada'
      });
    }
  };

  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'diaNombre',
      label: 'Día',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'horaEntrada',
      label: 'Hora Entrada',
      render: (value) => value || '—'
    },
    {
      key: 'horaSalida',
      label: 'Hora Salida',
      render: (value) => value || '—'
    },
    {
      key: 'horasBase',
      label: 'Horas Base',
      render: (value) => value ? `${value} hrs` : '—'
    },
    {
      key: 'porcentajeExtra',
      label: '% Extra',
      render: (value) => value ? `${value}%` : '—'
    },
    {
      key: 'aplicaHorasExtras',
      label: 'Aplica HE',
      render: (value) => value ? 'Sí' : 'No'
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jornadas Laborales</h1>
          <p className="text-gray-500 mt-1">
            Configura los horarios de trabajo por día de la semana
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleNuevo}
          icon={Plus}
        >
          Nueva Jornada
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert type="error" title="Error" message={error} dismissible />
      )}

      {/* Tabla de jornadas */}
      <Card>
        <ConfigTable
          columns={columns}
          data={jornadas}
          loading={loading}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          emptyMessage="No hay jornadas configuradas"
        />
      </Card>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Jornada' : 'Nueva Jornada'}
        size="md"
      >
        <JornadaForm
          initialData={jornadaData}
          onSubmit={handleGuardar}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Información adicional */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <Clock className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Las jornadas configuradas aquí se utilizarán para determinar 
              las horas regulares y calcular las horas extras automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JornadasPage;