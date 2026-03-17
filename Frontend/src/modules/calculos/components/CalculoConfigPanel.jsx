import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Button, Input, Card, Alert } from '../../../components/common';
import { useUIStore } from '../../../store';
import { LIMITES_LEGALES, TIPOS_HORAS_EXTRAS } from '../../../config/constants';

// ============================================
// COMPONENTE CALCULO CONFIG PANEL
// Panel de configuración del motor de cálculo
// ============================================

const CalculoConfigPanel = () => {
  const { showToast } = useUIStore();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    // Límites legales
    limiteTrimestral: LIMITES_LEGALES.HORAS_EXTRAS_MAX_TRIMESTRE,
    
    // Horarios
    horarioSemana: { inicio: '08:30', fin: '17:30' },
    horarioSabado: { inicio: '09:00', fin: '13:00' },
    horarioNocturno: { inicio: '21:00', fin: '07:00' },
    
    // Porcentajes
    porcentajes: {
      diurna: TIPOS_HORAS_EXTRAS.DIURNA.porcentaje,
      finSemana: TIPOS_HORAS_EXTRAS.FIN_SEMANA.porcentaje,
      nocturna: TIPOS_HORAS_EXTRAS.NOCTURNA.porcentaje,
      feriado: TIPOS_HORAS_EXTRAS.FERIADO.porcentaje
    },
    
    // Redondeo
    redondeo: 2,
    toleranciaMinutos: 20
  });

  // ========================================
  // HANDLERS
  // ========================================
  const handleChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSimpleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Aquí iría la llamada a la API para guardar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast({
        type: 'success',
        message: 'Configuración guardada correctamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al guardar la configuración'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      limiteTrimestral: LIMITES_LEGALES.HORAS_EXTRAS_MAX_TRIMESTRE,
      horarioSemana: { inicio: '08:30', fin: '17:30' },
      horarioSabado: { inicio: '09:00', fin: '13:00' },
      horarioNocturno: { inicio: '21:00', fin: '07:00' },
      porcentajes: {
        diurna: TIPOS_HORAS_EXTRAS.DIURNA.porcentaje,
        finSemana: TIPOS_HORAS_EXTRAS.FIN_SEMANA.porcentaje,
        nocturna: TIPOS_HORAS_EXTRAS.NOCTURNA.porcentaje,
        feriado: TIPOS_HORAS_EXTRAS.FERIADO.porcentaje
      },
      redondeo: 2,
      toleranciaMinutos: 20
    });
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">

      {/* Horarios */}
      <Card title="Horarios Laborales">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Lunes a Viernes</h4>
            <div className="space-y-2">
              <Input
                label="Hora entrada"
                type="time"
                value={config.horarioSemana.inicio}
                onChange={(e) => handleChange('horarioSemana', 'inicio', e.target.value)}
              />
              <Input
                label="Hora salida"
                type="time"
                value={config.horarioSemana.fin}
                onChange={(e) => handleChange('horarioSemana', 'fin', e.target.value)}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sábados</h4>
            <div className="space-y-2">
              <Input
                label="Hora entrada"
                type="time"
                value={config.horarioSabado.inicio}
                onChange={(e) => handleChange('horarioSabado', 'inicio', e.target.value)}
              />
              <Input
                label="Hora salida"
                type="time"
                value={config.horarioSabado.fin}
                onChange={(e) => handleChange('horarioSabado', 'fin', e.target.value)}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Horario Nocturno</h4>
            <div className="space-y-2">
              <Input
                label="Hora inicio"
                type="time"
                value={config.horarioNocturno.inicio}
                onChange={(e) => handleChange('horarioNocturno', 'inicio', e.target.value)}
              />
              <Input
                label="Hora fin"
                type="time"
                value={config.horarioNocturno.fin}
                onChange={(e) => handleChange('horarioNocturno', 'fin', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Porcentajes */}
      <Card title="Porcentajes de Horas Extras">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Horas Extras Diurnas"
            type="number"
            value={config.porcentajes.diurna}
            onChange={(e) => handleChange('porcentajes', 'diurna', parseInt(e.target.value))}
            helperText="% adicional"
            icon="%"
          />
          <Input
            label="Horas Extras Fin de Semana"
            type="number"
            value={config.porcentajes.finSemana}
            onChange={(e) => handleChange('porcentajes', 'finSemana', parseInt(e.target.value))}
            helperText="% adicional"
            icon="%"
          />
          <Input
            label="Horas Extras Nocturnas"
            type="number"
            value={config.porcentajes.nocturna}
            onChange={(e) => handleChange('porcentajes', 'nocturna', parseInt(e.target.value))}
            helperText="% adicional"
            icon="%"
          />
          <Input
            label="Días Feriados"
            type="number"
            value={config.porcentajes.feriado}
            onChange={(e) => handleChange('porcentajes', 'feriado', parseInt(e.target.value))}
            helperText="% adicional"
            icon="%"
          />
        </div>
      </Card>

      {/* Configuración adicional */}
      <Card title="Configuración Adicional">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Redondeo de horas"
            type="number"
            value={config.redondeo}
            onChange={(e) => handleSimpleChange('redondeo', parseInt(e.target.value))}
            helperText="Decimales para redondear"
          />
          <Input
            label="Tolerancia (minutos)"
            type="number"
            value={config.toleranciaMinutos}
            onChange={(e) => handleSimpleChange('toleranciaMinutos', parseInt(e.target.value))}
            helperText="Minutos de tolerancia antes de contar extras"
          />
        </div>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={handleReset}
          icon={RefreshCw}
        >
          Restablecer
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          icon={Save}
        >
          Guardar configuración
        </Button>
      </div>

      {/* Nota legal */}
      <Alert
        type="info"
        title="Nota legal"
        message="Los cambios en la configuración afectarán los cálculos futuros. Asegúrese de que los valores cumplan con el Código de Trabajo de República Dominicana."
      />
    </div>
  );
};

export default CalculoConfigPanel;