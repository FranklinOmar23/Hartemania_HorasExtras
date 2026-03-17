// ============================================
// src/layouts/index.js
// ============================================

// Primero importamos los componentes
import MainLayout from './MainLayout';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Breadcrumb from './components/Breadcrumb';

// Luego exportamos
export { MainLayout, Sidebar, Navbar, Footer, Breadcrumb };

// Exportación por defecto
export default {
  MainLayout,
  Sidebar,
  Navbar,
  Footer,
  Breadcrumb
};