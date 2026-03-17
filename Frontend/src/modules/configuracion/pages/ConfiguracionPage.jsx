import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Calendar, 
  Percent, 
  Settings, 
  Save, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card, Tabs, Button, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';

// ============================================
// PÁGINA PRINCIPAL DE CONFIGURACIÓN
// ============================================

const ConfiguracionPage = () => {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  
  const [activeTab, setActiveTab] = useState('general');
  const [configuracion, setConfiguracion] = useState({
    empresa: {
      nombre: 'Hartemania',
      rnc: '123456789',
      direccion: 'Santo Domingo, República Dominicana',
      telefono: '809-555-5555',
      email: 'info@hartemania.com'
    },
    limites: {
      horasMaxTrimestre: 68,
      horasMaxSemana: 23,
      diasLaboralesMes: 23.83
    },
    horarios: {
      jornadaDiurna: { inicio: '08:30', fin: '17:30' },
      jornadaSabado: { inicio: '09:00', fin: '13:00' },
      jornadaNocturna: { inicio: '21:00', fin: '07:00' }
    },
    notificaciones: {
      emailAlertas: true,
      limiteAlerta: 80, // porcentaje
      notificarAdmin: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);

  // ========================================
  // HANDLERS
  // ========================================
  const handleChange = (seccion, campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
    setEditando(true);
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast({
        type: 'success',
        message: 'Configuración guardada correctamente'
      });
      setEditando(false);
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al guardar configuración'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset a valores por defecto
    setConfiguracion({
      empresa: {
        nombre: 'Hartemania',
        rnc: '123456789',
        direccion: 'Santo Domingo, República Dominicana',
        telefono: '809-555-5555',
        email: 'info@hartemania.com'
      },
      limites: {
        horasMaxTrimestre: 68,
        horasMaxSemana: 23,
        diasLaboralesMes: 23.83
      },
      horarios: {
        jornadaDiurna: { inicio: '08:30', fin: '17:30' },
        jornadaSabado: { inicio: '09:00', fin: '13:00' },
        jornadaNocturna: { inicio: '21:00', fin: '07:00' }
      },
      notificaciones: {
        emailAlertas: true,
        limiteAlerta: 80,
        notificarAdmin: true
      }
    });
    setEditando(true);
    showToast({
      type: 'info',
      message: 'Valores restablecidos a configuración por defecto'
    });
  };

  // ========================================
  // RENDER DE SECCIONES
  // ========================================
  const renderGeneral = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Empresa</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la empresa
              </label>
              <input
                type="text"
                value={configuracion.empresa.nombre}
                onChange={(e) => handleChange('empresa', 'nombre', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RNC
              </label>
              <input
                type="text"
                value={configuracion.empresa.rnc}
                onChange={(e) => handleChange('empresa', 'rnc', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                value={configuracion.empresa.direccion}
                onChange={(e) => handleChange('empresa', 'direccion', e.target.value)}
                rows="2"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={configuracion.empresa.telefono}
                onChange={(e) => handleChange('empresa', 'telefono', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={configuracion.empresa.email}
                onChange={(e) => handleChange('empresa', 'email', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Límites Legales</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas extras máximas por trimestre
              </label>
              <input
                type="number"
                value={configuracion.limites.horasMaxTrimestre}
                onChange={(e) => handleChange('limites', 'horasMaxTrimestre', parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Según Código de Trabajo RD: 68 horas
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas extras máximas por semana
              </label>
              <input
                type="number"
                value={configuracion.limites.horasMaxSemana}
                onChange={(e) => handleChange('limites', 'horasMaxSemana', parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días laborales por mes
              </label>
              <input
                type="number"
                step="0.01"
                value={configuracion.limites.diasLaboralesMes}
                onChange={(e) => handleChange('limites', 'diasLaboralesMes', parseFloat(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Valor estándar: 23.83 días (para cálculo de salario diario)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios Laborales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lunes a Viernes
            </label>
            <div className="space-y-2">
              <input
                type="time"
                value={configuracion.horarios.jornadaDiurna.inicio}
                onChange={(e) => handleChange('horarios', 'jornadaDiurna', {
                  ...configuracion.horarios.jornadaDiurna,
                  inicio: e.target.value
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <input
                type="time"
                value={configuracion.horarios.jornadaDiurna.fin}
                onChange={(e) => handleChange('horarios', 'jornadaDiurna', {
                  ...configuracion.horarios.jornadaDiurna,
                  fin: e.target.value
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sábados
            </label>
            <div className="space-y-2">
              <input
                type="time"
                value={configuracion.horarios.jornadaSabado.inicio}
                onChange={(e) => handleChange('horarios', 'jornadaSabado', {
                  ...configuracion.horarios.jornadaSabado,
                  inicio: e.target.value
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <input
                type="time"
                value={configuracion.horarios.jornadaSabado.fin}
                onChange={(e) => handleChange('horarios', 'jornadaSabado', {
                  ...configuracion.horarios.jornadaSabado,
                  fin: e.target.value
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario Nocturno
            </label>
            <div className="space-y-2">
              <input
                type="time"
                value={configuracion.horarios.jornadaNocturna.inicio}
                onChange={(e) => handleChange('horarios', 'jornadaNocturna', {
                  ...configuracion.horarios.jornadaNocturna,
                  inicio: e.target.value
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <input
                type="time"
                value={configuracion.horarios.jornadaNocturna.fin}
                onChange={(e) => handleChange('horarios', 'jornadaNocturna', {
                  ...configuracion.horarios.jornadaNocturna,
                  fin: e.target.value
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones y Alertas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Alertas por email</p>
              <p className="text-xs text-gray-500">Recibir notificaciones cuando se excedan límites</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configuracion.notificaciones.emailAlertas}
                onChange={(e) => handleChange('notificaciones', 'emailAlertas', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porcentaje de alerta
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                value={configuracion.notificaciones.limiteAlerta}
                onChange={(e) => handleChange('notificaciones', 'limiteAlerta', parseInt(e.target.value))}
                className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <span className="text-sm text-gray-500">% del límite legal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ========================================
  // TABS
  // ========================================
  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'jornadas', label: 'Jornadas', icon: Clock },
    { id: 'feriados', label: 'Feriados', icon: Calendar },
    { id: 'tipos-he', label: 'Tipos de HE', icon: Percent }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 mt-1">
            Administra la configuración general del sistema
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            icon={RefreshCw}
            disabled={loading}
          >
            Restablecer
          </Button>
          <Button
            variant="primary"
            onClick={handleGuardar}
            loading={loading}
            icon={Save}
            disabled={!editando}
          >
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'general') {
                  navigate(`/configuracion/${tab.id}`);
                }
              }}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon size={18} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <Card>
        {activeTab === 'general' && renderGeneral()}
      </Card>

      {/* Alerta de cambios sin guardar */}
      {editando && (
        <Alert
          type="warning"
          title="Cambios sin guardar"
          message="Hay cambios pendientes en la configuración general. No olvides guardarlos."
          className="fixed bottom-6 right-6 w-96 shadow-lg"
        />
      )}
    </div>
  );
};

export default ConfiguracionPage;