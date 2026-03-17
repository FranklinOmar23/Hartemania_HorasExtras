// ============================================
// src/components/common/index.js
// ============================================

// Importamos todos los componentes
import Button, { ButtonGroup, IconButton } from './Button';
import Input, { Textarea, Select, Checkbox, Radio } from './Input';
import Modal, { ConfirmModal } from './Modal';
import Table, { TableCell, TableHeader } from './Table';
import Alert, { Toast } from './Alert';
import Badge, { StatusBadge, TipoHEBadge } from './Badge';
import Card from './Card';
import DatePicker, { RangePicker } from './DatePicker';
import FileUploader, { ExcelUploader } from './FileUploader';
import Pagination from './Pagination';
import SearchBar, { FilterBar } from './SearchBar';
import Spinner, { LoadingOverlay, LoadingDots } from './Spinner';
import Tabs, { TabPanel } from './Tabs';

// Exportaciones nombradas
export { 
  Button, ButtonGroup, IconButton,
  Input, Textarea, Select, Checkbox, Radio,
  Modal, ConfirmModal,
  Table, TableCell, TableHeader,
  Alert, Toast,
  Badge, StatusBadge, TipoHEBadge,
  Card,
  DatePicker, RangePicker,
  FileUploader, ExcelUploader,
  Pagination,
  SearchBar, FilterBar,
  Spinner, LoadingOverlay, LoadingDots,
  Tabs, TabPanel
};

// Exportación por defecto
export default {
  Button,
  ButtonGroup,
  IconButton,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Modal,
  ConfirmModal,
  Table,
  TableCell,
  TableHeader,
  Alert,
  Toast,
  Badge,
  StatusBadge,
  TipoHEBadge,
  Card,
  DatePicker,
  RangePicker,
  FileUploader,
  ExcelUploader,
  Pagination,
  SearchBar,
  FilterBar,
  Spinner,
  LoadingOverlay,
  LoadingDots,
  Tabs,
  TabPanel
};