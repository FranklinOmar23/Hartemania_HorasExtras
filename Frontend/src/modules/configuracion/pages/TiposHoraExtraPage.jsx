import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Percent, Save, X } from 'lucide-react';
import { useTiposHE } from '../hooks/useTiposHE';
import TipoHoraExtraForm from '../components/TipoHoraExtraForm';
import ConfigTable from '../components/ConfigTable';
import { Card, Button, Modal, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// PÁGINA DE CONFIGURACIÓN DE TIPOS DE HE
// ============================================

const TiposHoraExtraPage = () => {
  const { showToast, openConfirmModal } = useUIStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [tipoData, setTipoData] = useState(null);

  const {
    tipos,
    loading,
    error,
    fetchTipos,
    crearTipo,
    actualizarTipo,
    eliminarTipo
  } = useTiposHE();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    fetchTipos();
  }, []);

  // ========================================
  // HANDLERS
  // ========================================
  const handleNuevo = () => {
    setEditando(null);
    setTipoData(null);
    setModalOpen(true);
  };

  const handleEditar = (tipo) => {
    setEditando(tipo);
    setTipoData(tipo);
    setModalOpen(true);
  };

  const handleEliminar = (tipo) => {
    openConfirmModal({
      title: 'Eliminar tipo de HE',
      message: `¿Estás seguro de eliminar ${tipo.nombre}?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await eliminarTipo(tipo.id);
          showToast({
            type: 'success',
            message: 'Tipo de HE eliminado correctamente'
          });
        } catch (error) {
          showToast({
            type: 'error',
            message: 'Error al eliminar el tipo de HE'
          });
        }
      }
    });
  };

  const handleGuardar = async (data) => {
    try {
      if (editando) {
        await actualizarTipo(editando.id, data);
        showToast({
          type: 'success',
          message: 'Tipo de HE actualizado correctamente'
        });
      } else {
        await crearTipo(data);
        showToast({
          type: 'success',
          message: 'Tipo de HE creado correctamente'
        });
      }
      setModalOpen(false);
      fetchTipos();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Error al guardar el tipo de HE'
      });
    }
  };

  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      render: (value) => (
        <span className="font-mono font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'nombre',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (value) => value || '—'
    },
    {
      key: 'porcentaje',
      label: 'Porcentaje',
      render: (value) => (
        <span className="font-bold text-blue-600">{value}%</span>
      )
    },
    {
      key: 'factorMultiplicador',
      label: 'Factor',
      render: (value) => (
        <span className="font-mono">{value.toFixed(2)}x</span>
      )
    },
    {
      key: 'aplicaFinSemana',
      label: 'Fin de Semana',
      render: (value) => value ? 'Sí' : 'No'
    },
    {
      key: 'aplicaFeriados',
      label: 'Feriados',
      render: (value) => value ? 'Sí' : 'No'
    },
    {
      key: 'aplicaNocturno',
      label: 'Nocturno',
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
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Horas Extras</h1>
          <p className="text-gray-500 mt-1">
            Configura los porcentajes y reglas para cada tipo de hora extra
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleNuevo}
          icon={Plus}
        >
          Nuevo Tipo
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert type="error" title="Error" message={error} dismissible />
      )}

      {/* Tabla de tipos */}
      <Card>
        <ConfigTable
          columns={columns}
          data={tipos}
          loading={loading}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          emptyMessage="No hay tipos de horas extras configurados"
        />
      </Card>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Tipo de HE' : 'Nuevo Tipo de HE'}
        size="lg"
      >
        <TipoHoraExtraForm
          initialData={tipoData}
          onSubmit={handleGuardar}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Información legal */}
      <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
        <div className="flex">
          <Percent className="h-5 w-5 text-purple-400" />
          <div className="ml-3">
            <p className="text-sm text-purple-700">
              <strong>Según Código de Trabajo RD:</strong> Los porcentajes estándar son 
              35% para horas diurnas, 100% para fines de semana y feriados, y 15% para 
              horas nocturnas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiposHoraExtraPage;