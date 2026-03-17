// src/routes/AppRouter.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts';  // ✅ Debe funcionar ahora

// Imports de módulos
import { DashboardPage } from '../modules/dashboard';  // ✅ Debe funcionar ahora
import { EmpleadosPage, EmpleadoFormPage, EmpleadoDetallePage } from '../modules/empleados';
import { ImportacionPage, ImportacionDetallePage } from '../modules/importacion';
import { RegistrosPage, RegistroManualPage } from '../modules/registros';
import { CalculosPage, CalculoDetallePage } from '../modules/calculos';
import { ReportesPage, ReporteGeneradoPage } from '../modules/reportes';
import { ConfiguracionPage, JornadasPage, FeriadosPage, TiposHoraExtraPage } from '../modules/configuracion';

// ... resto del código
// ============================================
// CONFIGURACIÓN DE RUTAS
// ============================================

const AppRouter = () => {
  return (
    <Routes>
      {/* ========================================
          RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
      ======================================== */}
      <Route path="/" element={
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      } />

      <Route path="/calculos/detalle" element={
        <MainLayout>
          <CalculoDetallePage />
        </MainLayout>
      } />

      {/* ========================================
          RUTAS DE EMPLEADOS
      ======================================== */}
      <Route path="/empleados">
        <Route index element={
          <MainLayout>
            <EmpleadosPage />
          </MainLayout>
        } />
        <Route path="nuevo" element={
          <MainLayout>
            <EmpleadoFormPage />
          </MainLayout>
        } />
        <Route path="editar/:id" element={
          <MainLayout>
            <EmpleadoFormPage />
          </MainLayout>
        } />
        <Route path=":id" element={
          <MainLayout>
            <EmpleadoDetallePage />
          </MainLayout>
        } />
      </Route>

      {/* ========================================
          RUTAS DE IMPORTACIÓN
      ======================================== */}
      <Route path="/importacion">
        <Route index element={
          <MainLayout>
            <ImportacionPage />
          </MainLayout>
        } />
        <Route path=":id" element={
          <MainLayout>
            <ImportacionDetallePage />
          </MainLayout>
        } />
      </Route>

      {/* ========================================
          RUTAS DE REGISTROS
      ======================================== */}
      <Route path="/registros">
        <Route index element={
          <MainLayout>
            <RegistrosPage />
          </MainLayout>
        } />
        <Route path="manual" element={
          <MainLayout>
            <RegistroManualPage />
          </MainLayout>
        } />
      </Route>

      {/* ========================================
          RUTAS DE CÁLCULOS
      ======================================== */}
      <Route path="/calculos">
        <Route index element={
          <MainLayout>
            <CalculosPage />
          </MainLayout>
        } />
        <Route path=":id" element={
          <MainLayout>
            <CalculoDetallePage />
          </MainLayout>
        } />
      </Route>

      {/* ========================================
          RUTAS DE REPORTES
      ======================================== */}
      <Route path="/reportes">
        <Route index element={
          <MainLayout>
            <ReportesPage />
          </MainLayout>
        } />
        <Route path="generado" element={
          <MainLayout>
            <ReporteGeneradoPage />
          </MainLayout>
        } />
      </Route>

      {/* ========================================
          RUTAS DE CONFIGURACIÓN
      ======================================== */}
      <Route path="/configuracion">
        <Route index element={
          <MainLayout>
            <ConfiguracionPage />
          </MainLayout>
        } />
        <Route path="jornadas" element={
          <MainLayout>
            <JornadasPage />
          </MainLayout>
        } />
        <Route path="feriados" element={
          <MainLayout>
            <FeriadosPage />
          </MainLayout>
        } />
        <Route path="tipos-he" element={
          <MainLayout>
            <TiposHoraExtraPage />
          </MainLayout>
        } />
      </Route>

      {/* ========================================
          RUTA POR DEFECTO (404)
      ======================================== */}
      <Route path="*" element={
        <MainLayout>
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Página no encontrada</h2>
            <p className="text-gray-500 mb-6">La página que buscas no existe o ha sido movida.</p>
            <a href="/" className="text-blue-600 hover:text-blue-800 underline">
              Volver al inicio
            </a>
          </div>
        </MainLayout>
      } />
    </Routes>
  );
};

export default AppRouter;