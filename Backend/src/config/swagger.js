// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hartemania - Sistema de Horas Extras API',
      version: '1.0.0',
      description: 'API para gestión de empleados, horas extras y reportes quincenales',
      contact: {
        name: 'Soporte Técnico',
        email: 'soporte@hartemania.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desarrollo'
      },
      {
        url: 'https://api.hartemania.com/api/v1',
        description: 'Servidor de Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Empleado: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            codigo: { type: 'string', example: '40' },
            nombre: { type: 'string', example: 'SERGIO CRISTIAN' },
            apellido: { type: 'string', example: 'TAVERAS PINTO' },
            posicion: { type: 'string', example: 'COORDINADOR DE TALLER' },
            departamento: { type: 'string', example: 'Taller' },
            salarioBase: { type: 'number', example: 65000 },
            salarioDiario: { type: 'number', example: 2728.62 },
            salarioPorHora: { type: 'number', example: 341.08 },
            fechaIngreso: { type: 'string', format: 'date', example: '2020-01-15' },
            tipoJornada: { type: 'string', enum: ['DIURNA', 'NOCTURNA', 'MIXTA'] },
            activo: { type: 'boolean', example: true }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Mensaje de error' }
          }
        }
      },
      responses: {
        SuccessResponse: {
          description: 'Operación exitosa',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'object' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        ErrorResponse: {
          description: 'Error en la operación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Empleados',
        description: 'CRUD de empleados'
      },
      {
        name: 'Importación',
        description: 'Importación de archivos Excel'
      },
      {
        name: 'Registros Manuales',
        description: 'Registro manual de horas'
      },
      {
        name: 'Cálculos',
        description: 'Cálculo de horas extras'
      },
      {
        name: 'Reportes',
        description: 'Reportes quincenales'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;