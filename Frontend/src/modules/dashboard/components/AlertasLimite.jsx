import React, { useState } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Button } from '../../../components/common';
import { formatearHoras } from '../../../utils';
import { LIMITES_LEGALES } from '../../../config/constants';

// ============================================
// COMPONENTE ALERTAS LIMITE
// Alertas de límites legales de horas extras
// ============================================

const AlertasLimite = ({ alertas = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || alertas.length === 0) return null;

  // ========================================
  // AGRUPAR ALERTAS POR TIPO
  // ========================================
  const alertasCriticas = alertas.filter(a => a.tipo === 'CRITICA');
  const alertasAdvertencia = alertas.filter(a => a.tipo === 'ADVERTENCIA');

  // ========================================
  // RENDER
  // ========================================
  return (
    <Card className={`border-l-4 ${
      alertasCriticas.length > 0 ? 'border-red-500' : 'border-yellow-500'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${
            alertasCriticas.length > 0 ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <AlertTriangle className={`h-5 w-5 ${
              alertasCriticas.length > 0 ? 'text-red-600' : 'text-yellow-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Alertas de Límite Legal
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {alertasCriticas.length} alerta(s) crítica(s) y {alertasAdvertencia.length} advertencia(s)
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            icon={expanded ? ChevronUp : ChevronDown}
          >
            {expanded ? 'Ver menos' : 'Ver detalles'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            icon={X}
          />
        </div>
      </div>

      {/* Detalles expandidos */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Alertas críticas */}
          {alertasCriticas.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2">
                Alertas Críticas
              </h4>
              <div className="space-y-2">
                {alertasCriticas.map((alerta, index) => (
                  <div
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          {alerta.empleado}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {alerta.mensaje}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-800">
                          {formatearHoras(alerta.horasActuales)}
                        </p>
                        <p className="text-xs text-red-600">
                          Límite: {formatearHoras(alerta.limite)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-red-200 rounded-full h-1.5">
                        <div 
                          className="bg-red-600 h-1.5 rounded-full"
                          style={{ width: `${(alerta.horasActuales / alerta.limite) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertas de advertencia */}
          {alertasAdvertencia.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-600 mb-2">
                Advertencias
              </h4>
              <div className="space-y-2">
                {alertasAdvertencia.map((alerta, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          {alerta.empleado}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          {alerta.mensaje}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-800">
                          {formatearHoras(alerta.horasActuales)}
                        </p>
                        <p className="text-xs text-yellow-600">
                          Límite: {formatearHoras(alerta.limite)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información del límite legal */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">
              Según Código de Trabajo de República Dominicana:
            </p>
            <p>
              • Límite máximo: {LIMITES_LEGALES.HORAS_EXTRAS_MAX_TRIMESTRE} horas por trimestre
            </p>
            <p>
              • Las horas extras no pueden exceder 68 horas en un trimestre
            </p>
            <p>
              • Se recomienda no superar el 80% del límite para evitar riesgos legales
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AlertasLimite;