// ============================================
// ARCHIVO DE EXPORTACIÓN DE COMPONENTES FEEDBACK
// ============================================

// Exportaciones nombradas
export { default as ErrorBoundary, withErrorBoundary, useErrorHandler } from './ErrorBoundary';
export { default as LoadingScreen, SkeletonLoader, PageLoader, SectionLoader } from './LoadingScreen';
export { default as ToastProvider, SimpleToast, useToast, useToastNotifications } from './Toast';

// ============================================
// EXPORTACIÓN POR DEFECTO
// ============================================
export default {
  ErrorBoundary,
  withErrorBoundary,
  useErrorHandler,
  LoadingScreen,
  SkeletonLoader,
  PageLoader,
  SectionLoader,
  ToastProvider,
  SimpleToast,
  useToast,
  useToastNotifications
};