// src/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { HTTP_STATUS } from '../utils/constants.js';
import { env } from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(__dirname, '../../uploads');
const tempDir = path.join(uploadDir, 'temp');
const excelDir = path.join(uploadDir, 'excels');

[uploadDir, tempDir, excelDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Configuración de almacenamiento
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Guardar en temp primero, luego se moverá si es válido
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para evitar colisiones
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${Date.now()}-${uniqueId}${extension}`;
    cb(null, filename);
  }
});

/**
 * Filtro de archivos permitidos
 */
const fileFilter = (req, file, cb) => {
  const allowedExtensions = env.UPLOAD.ALLOWED_EXTENSIONS;
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(extension)) {
    // Validar tipo MIME también
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no válido'), false);
    }
  } else {
    cb(new Error(`Solo se permiten archivos: ${allowedExtensions.join(', ')}`), false);
  }
};

/**
 * Configuración de multer
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: env.UPLOAD.MAX_SIZE, // 10MB por defecto
    files: 1 // Solo un archivo por petición
  }
});

/**
 * Middleware para manejar errores de multer
 */
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `El archivo excede el tamaño máximo de ${env.UPLOAD.MAX_SIZE / 1024 / 1024}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Solo se permite un archivo por petición'
      });
    }
  }
  
  if (err.message.includes('Solo se permiten archivos')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: err.message
    });
  }
  
  next(err);
};

/**
 * Middleware para mover archivo después de validación
 */
export const moveToPermanent = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  const tempPath = req.file.path;
  const permanentPath = path.join(excelDir, req.file.filename);
  
  fs.rename(tempPath, permanentPath, (err) => {
    if (err) {
      return next(err);
    }
    req.file.path = permanentPath;
    req.file.destination = excelDir;
    next();
  });
};

/**
 * Middleware para limpiar archivos temporales
 */
export const cleanupTempFiles = (req, res, next) => {
  // Limpiar archivos temporales después de la respuesta
  res.on('finish', () => {
    const tempDir = path.join(uploadDir, 'temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      const now = Date.now();
      
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;
        const maxAge = env.UPLOAD.TEMP_RETENTION_HOURS * 60 * 60 * 1000;
        
        // Eliminar archivos más antiguos que el tiempo de retención
        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });
  
  next();
};

/**
 * Middleware para validar que el archivo existe
 */
export const validateFileExists = (req, res, next) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'No se ha subido ningún archivo'
    });
  }
  next();
};

// Exportar configuración
export default upload;