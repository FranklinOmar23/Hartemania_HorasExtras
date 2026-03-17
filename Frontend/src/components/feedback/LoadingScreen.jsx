import React from 'react';
import Spinner from '../common/Spinner';
import Card from '../common/Card';

// ============================================
// COMPONENTE LOADING SCREEN
// Pantalla de carga completa o parcial
// ============================================

const LoadingScreen = ({
  fullScreen = false,
  text = 'Cargando...',
  spinnerSize = 'lg',
  spinnerColor = 'primary',
  progress,
  progressTotal,
  showProgress = false,
  children,
  className = ''
}) => {
  // ========================================
  // CALCULAR PROGRESO
  // ========================================
  const progressPercentage = progress && progressTotal
    ? Math.round((progress / progressTotal) * 100)
    : 0;

  // ========================================
  // LOADING CONTENT
  // ========================================
  const LoadingContent = () => (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Spinner size={spinnerSize} color={spinnerColor} />
      
      {text && (
        <p className="mt-4 text-gray-600 text-sm">{text}</p>
      )}

      {showProgress && progress !== undefined && progressTotal && (
        <div className="mt-4 w-64">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {progress} de {progressTotal}
          </p>
        </div>
      )}

      {children}
    </div>
  );

  // ========================================
  // RENDER
  // ========================================
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

// ============================================
// SKELETON LOADING
// ============================================
export const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
  const skeletons = [];

  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'card':
        skeletons.push(
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        );
        break;

      case 'table':
        skeletons.push(
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        );
        break;

      case 'list':
        skeletons.push(
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        );
        break;

      case 'text':
        skeletons.push(
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        );
        break;

      default:
        skeletons.push(
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        );
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {skeletons}
    </div>
  );
};

// ============================================
// PAGE LOADER (para cambios de página)
// ============================================
export const PageLoader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-blue-200 z-50">
      <div className="h-full bg-blue-600 animate-loading-bar"></div>
    </div>
  );
};

// ============================================
// SECTION LOADER
// ============================================
export const SectionLoader = ({ height = '200px', text = 'Cargando sección...' }) => {
  return (
    <div
      className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
      style={{ height }}
    >
      <div className="text-center">
        <Spinner size="md" />
        <p className="mt-2 text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;