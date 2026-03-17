import React from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { AlertTriangle } from 'lucide-react';

// ============================================
// COMPONENTE ERROR BOUNDARY
// Captura errores de componentes hijos
// ============================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error en un servicio de logging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Si hay un callback de error, ejecutarlo
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // UI personalizada para el error
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI por defecto
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-lg w-full">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Algo salió mal!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página o contacta al soporte técnico.
              </p>

              {/* Mensaje de error en desarrollo */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 text-left">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs bg-red-50 p-3 rounded overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex space-x-3 justify-center">
                <Button
                  variant="primary"
                  onClick={this.handleReload}
                >
                  Recargar página
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleReset}
                >
                  Intentar de nuevo
                </Button>
              </div>

              {/* Enlace de soporte */}
              <p className="mt-6 text-sm text-gray-500">
                Si el problema persiste, contacta a{' '}
                <a
                  href="mailto:soporte@hartemania.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  soporte@hartemania.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// HOOK DE ERROR BOUNDARY
// ============================================
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  if (error) {
    throw error;
  }

  return setError;
};

// ============================================
// COMPONENTE CON ERROR BOUNDARY
// ============================================
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedWithErrorBoundary(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;