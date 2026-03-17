import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Calendar, Download, RefreshCw } from 'lucide-react';
import { useCalculos } from '../hooks/useCalculos';
import CalculoForm from '../components/CalculoForm';
import CalculoResumen from '../components/CalculoResumen';
import CalculoEmpleadoTable from '../components/CalculoEmpleadoTable';
import CalculoConfigPanel from '../components/CalculoConfigPanel';
import { Button, Card, Alert, Spinner, Tabs } from '../../../components/common';
import { useUIStore } from '../../../store';
import { MESES } from '../../../config/constants';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ============================================
// PÁGINA PRINCIPAL DE CÁLCULOS
// ============================================

const CalculosPage = () => {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  
  // Estado
  const [selectedPeriodo, setSelectedPeriodo] = useState({
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    quincena: 1
  });
  const [activeTab, setActiveTab] = useState('resumen');
  const [calculando, setCalculando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Hook personalizado - ✅ AHORA INCLUYE paginacion
  const {
    resultados,
    loading,
    error,
    fetchResultados,
    calcularQuincena,
    limpiarResultados,
    paginacion,           // ← AGREGADO
    cambiarPagina,        // ← AGREGADO
    cambiarPageSize       // ← AGREGADO
  } = useCalculos();

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    cargarResultados();
  }, [selectedPeriodo]);

  // ========================================
  // FUNCIONES
  // ========================================
  const cargarResultados = async () => {
    try {
      await fetchResultados(
        selectedPeriodo.anio,
        selectedPeriodo.mes,
        selectedPeriodo.quincena
      );
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al cargar los resultados'
      });
    }
  };

  const handleCalcular = async () => {
    setCalculando(true);
    try {
      const result = await calcularQuincena(
        selectedPeriodo.anio,
        selectedPeriodo.mes,
        selectedPeriodo.quincena
      );
      
      showToast({
        type: 'success',
        message: `Cálculo completado. Total a pagar: RD$ ${result.totalPagar?.toFixed(2)}`
      });
      
      setActiveTab('resumen');
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Error al realizar el cálculo'
      });
    } finally {
      setCalculando(false);
    }
  };

  const handleExportar = async (formato = 'excel') => {
    setExportando(true);
    try {
      const nombreMes = MESES.find(m => m.id === selectedPeriodo.mes)?.nombre;
      const fileName = `HE_${selectedPeriodo.anio}_${nombreMes}_Q${selectedPeriodo.quincena}.${formato}`;
      
      if (formato === 'excel') {
        exportarExcel(fileName);
      } else if (formato === 'pdf') {
        exportarPDF(fileName);
      }
      
      showToast({
        type: 'success',
        message: 'Reporte exportado correctamente'
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Error al exportar el reporte'
      });
    } finally {
      setExportando(false);
    }
  };

  const exportarExcel = (fileName) => {
    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja de resumen
    const resumenData = [
      ['RESUMEN DE HORAS EXTRAS'],
      [`Período: ${selectedPeriodo.anio} - ${MESES.find(m => m.id === selectedPeriodo.mes)?.nombre} - Quincena ${selectedPeriodo.quincena}`],
      [],
      ['Concepto', 'Horas 35%', 'Horas 100%', 'Horas 15%', 'Horas Feriado', 'Total Horas', 'Total a Pagar'],
      [
        'Total General',
        resultados?.totales?.horas35?.toFixed(2) || '0.00',
        resultados?.totales?.horas100?.toFixed(2) || '0.00',
        resultados?.totales?.horas15?.toFixed(2) || '0.00',
        resultados?.totales?.horasFeriado?.toFixed(2) || '0.00',
        resultados?.totales?.totalHoras?.toFixed(2) || '0.00',
        `RD$ ${resultados?.totales?.totalPagar?.toFixed(2) || '0.00'}`
      ]
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Hoja de detalle por empleado
    if (resultados?.empleados?.length > 0) {
      const detalleData = [
        ['Código', 'Empleado', 'Horas 35%', 'Horas 100%', 'Horas 15%', 'Horas Feriado', 
         'Monto 35%', 'Monto 100%', 'Monto 15%', 'Monto Feriado', 'Total a Pagar'],
        ...resultados.empleados.map(emp => [
          emp.codigo,
          emp.nombre,
          emp.horas35?.toFixed(2),
          emp.horas100?.toFixed(2),
          emp.horas15?.toFixed(2),
          emp.horasFeriado?.toFixed(2),
          `RD$ ${emp.monto35?.toFixed(2)}`,
          `RD$ ${emp.monto100?.toFixed(2)}`,
          `RD$ ${emp.monto15?.toFixed(2)}`,
          `RD$ ${emp.montoFeriado?.toFixed(2)}`,
          `RD$ ${emp.totalPagar?.toFixed(2)}`
        ])
      ];

      const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
      XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle por Empleado');
    }

    // Guardar archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  };

  const exportarPDF = (fileName) => {
    console.log('Exportando a PDF:', fileName);
  };

  const handleVerDetalle = (empleado) => {
    navigate('/calculos/detalle', { 
      state: { 
        empleado,
        periodo: selectedPeriodo
      } 
    });
  };

  const handlePageChange = (page) => {
    cambiarPagina(page, selectedPeriodo.anio, selectedPeriodo.mes, selectedPeriodo.quincena);
  };

  const handlePageSizeChange = (size) => {
    cambiarPageSize(size, selectedPeriodo.anio, selectedPeriodo.mes, selectedPeriodo.quincena);
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen General', icon: Calculator },
    { id: 'detalle', label: 'Detalle por Empleado', icon: Calendar },
    { id: 'config', label: 'Configuración', icon: RefreshCw }
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cálculo de Horas Extras</h1>
          <p className="text-gray-500 mt-1">
            Calcula las horas extras por quincena según el código de trabajo
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowConfig(!showConfig)}
            icon={RefreshCw}
          >
            Configuración
          </Button>
          <Button
            variant="success"
            onClick={handleCalcular}
            loading={calculando}
            icon={Calculator}
          >
            Calcular Quincena
          </Button>
        </div>
      </div>

      {/* Formulario de período */}
      <Card>
        <CalculoForm
          periodo={selectedPeriodo}
          onChange={setSelectedPeriodo}
          onCalcular={handleCalcular}
          loading={calculando}
        />
      </Card>

      {/* Panel de configuración */}
      {showConfig && (
        <Card title="Configuración del Cálculo">
          <CalculoConfigPanel />
        </Card>
      )}

      {/* Tabs de resultados */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Cargando resultados..." />
        </div>
      ) : error ? (
        <Alert
          type="error"
          title="Error"
          message={error}
          dismissible
        />
      ) : resultados ? (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

          {/* Contenido de tabs */}
          <div className="mt-6">
            {activeTab === 'resumen' && (
              <CalculoResumen
                totales={resultados.totales}
                loading={loading}
              />
            )}

            {activeTab === 'detalle' && (
              <CalculoEmpleadoTable
                empleados={resultados.empleados}
                loading={loading}
                onVerDetalle={handleVerDetalle}
                paginacion={paginacion}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}

            {activeTab === 'config' && (
              <CalculoConfigPanel />
            )}
          </div>

          {/* Botones de exportación */}
          {resultados && (
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleExportar('excel')}
                loading={exportando}
                icon={Download}
              >
                Exportar Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportar('pdf')}
                loading={exportando}
                icon={Download}
              >
                Exportar PDF
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay cálculos para este período
            </h3>
            <p className="text-gray-500 mb-4">
              Selecciona una quincena y haz clic en "Calcular" para generar los resultados
            </p>
            <Button
              variant="primary"
              onClick={handleCalcular}
              loading={calculando}
            >
              Calcular ahora
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CalculosPage;