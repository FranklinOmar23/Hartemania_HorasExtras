import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Save, X } from 'lucide-react';
import { useFeriados } from '../hooks/useFeriados';
import FeriadoForm from '../components/FeriadoForm';
import ConfigTable from '../components/ConfigTable';
import { Card, Button, Modal, Alert, Tabs } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// PÁGINA DE CONFIGURACIÓN DE FERIADOS
// ============================================

const FeriadosPage = () => {
  const { showToast, openConfirmModal } = useUIStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [feriadoData, setFeriadoData] = useState(null);
  const [activeTab, setActiveTab] = useState('fijos');

  const {
    feriados,
    loading,
    error,
    fetchFeriados,
    crearFeriado,
    actualizarFeriado,
    eliminarFeriado
  } = useFeriados();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    fetchFeriados();
  }, []);

  // ========================================
  // FILTRAR FERIADOS
  // ========================================
  const feriadosFijos = feriados.filter(f => f.esFijo);
  const feriadosMoviles = feriados.filter(f => !f.esFijo);

  // ========================================
  // HANDLERS
  // ========================================
  const handleNuevo = () => {
    setEditando(null);
    setFeriadoData(null);
    setModalOpen(true);
  };

  const handleEditar = (feriado) => {
    setEditando(feriado);
    setFeriadoData(feriado);
    setModalOpen(true);
  };

  const handleEliminar = (feriado) => {
    openConfirmModal({
      title: 'Eliminar feriado',
      message: `¿Estás seguro de eliminar ${feriado.nombre}?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await eliminarFeriado(feriado.id);
          showToast({
            type: 'success',
            message: 'Feriado eliminado correctamente'
          });
        } catch (error) {
          showToast({
            type: 'error',
            message: 'Error al eliminar el feriado'
          });
        }
      }
    });
  };

  const handleGuardar = async (data) => {
    try {
      if (editando) {
        await actualizarFeriado(editando.id, data);
        showToast({
          type: 'success',
          message: 'Feriado actualizado correctamente'
        });
      } else {
        await crearFeriado(data);
        showToast({
          type: 'success',
          message: 'Feriado creado correctamente'
        });
      }
      setModalOpen(false);
      fetchFeriados();
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Error al guardar el feriado'
      });
    }
  };

  // ========================================
  // COLUMNAS DE LA TABLA
  // ========================================
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'dia',
      label: 'Día',
      render: (value, row) => (
        <span>{value} de {getNombreMes(row.mes)}</span>
      )
    },
    {
      key: 'esFijo',
      label: 'Tipo',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'Fijo' : 'Móvil'}
        </span>
      )
    },
    {
      key: 'aplicaPorcentaje100',
      label: 'Aplica 100%',
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
  // FUNCIÓN AUXILIAR
  // ========================================
  const getNombreMes = (mes) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
  };

  // ========================================
  // TABS
  // ========================================
  const tabs = [
    { id: 'fijos', label: `Fijos (${feriadosFijos.length})` },
    { id: 'moviles', label: `Móviles (${feriadosMoviles.length})` }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feriados</h1>
          <p className="text-gray-500 mt-1">
            Calendario de días feriados según legislación dominicana
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleNuevo}
          icon={Plus}
        >
          Nuevo Feriado
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert type="error" title="Error" message={error} dismissible />
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tabla de feriados */}
      <Card>
        <ConfigTable
          columns={columns}
          data={activeTab === 'fijos' ? feriadosFijos : feriadosMoviles}
          loading={loading}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          emptyMessage={`No hay feriados ${activeTab === 'fijos' ? 'fijos' : 'móviles'} configurados`}
        />
      </Card>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Feriado' : 'Nuevo Feriado'}
        size="md"
      >
        <FeriadoForm
          initialData={feriadoData}
          onSubmit={handleGuardar}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Información de feriados RD */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <Calendar className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Feriados de República Dominicana:</strong> Los feriados móviles 
              (Día del Trabajo, Corpus Christi) se calculan automáticamente según el año.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeriadosPage;