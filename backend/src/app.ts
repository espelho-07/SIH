import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { sendSuccess } from './utils/response';

const app: Application = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to general API endpoints
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  sendSuccess(res, 'Healthcare Accessibility Backend API is running smoothly', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Full OpenAPI 3.0 Specification
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Public Healthcare Accessibility Platform API',
    version: '1.0.0',
    description:
      'Unified REST API backend for Location-wise Doctor/Hospital Availability, Nearest Medical Facility Search, Medicine Availability, and Patient Appointment Booking.',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token obtained from POST /auth/login',
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'User registration, login, and token management' },
    { name: 'Hospitals', description: 'Hospital catalog & geolocation search' },
    { name: 'Facilities', description: 'Nearest medical facility locator' },
    { name: 'Doctors', description: 'Doctor directory & availability' },
    { name: 'Medicines', description: 'Medicine catalog & location stock lookup' },
    { name: 'Appointments', description: 'Patient appointment booking, slots & cancellation' },
    { name: 'Tokens', description: 'Hospital OPD queue & digital token management' },
    { name: 'Teleconsultation', description: 'Remote doctor-patient teleconsultation & real-time messaging' },
    { name: 'Voice AI', description: 'Preliminary symptom-based disease assessment & red flag detection' },
    { name: 'Emergency Blood', description: 'Real-time blood group availability search & staff inventory management' },
    { name: 'Admin', description: 'Protected healthcare data & appointment management' },
  ],
  paths: {
    '/hospitals/nearby/treatment': {
      get: {
        tags: ['Hospitals'],
        summary: 'Nearest Treatment-wise Hospital Search',
        parameters: [
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number', example: 22.3039 } },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number', example: 70.8022 } },
          { name: 'treatment', in: 'query', required: true, schema: { type: 'string', example: 'Orthopedic' } },
          { name: 'radius', in: 'query', schema: { type: 'number', default: 20, example: 20 } },
        ],
        responses: { 200: { description: 'Hospitals providing treatment sorted by distance' } },
      },
    },
    '/hospitals/treatment-cost': {
      get: {
        tags: ['Hospitals'],
        summary: 'Common Healthcare Cost Lookup & Hospital Cost Comparison',
        parameters: [
          { name: 'treatment', in: 'query', required: true, schema: { type: 'string', example: 'X-Ray' } },
          { name: 'hospitalId', in: 'query', schema: { type: 'string' } },
          { name: 'latitude', in: 'query', schema: { type: 'number', example: 22.3039 } },
          { name: 'longitude', in: 'query', schema: { type: 'number', example: 70.8022 } },
        ],
        responses: { 200: { description: 'Estimated healthcare cost range breakdown across hospitals' } },
      },
    },
    '/emergency/blood': {
      get: {
        tags: ['Emergency Blood'],
        summary: 'Emergency Blood Group Availability Search (Nearest First)',
        parameters: [
          { name: 'bloodGroup', in: 'query', required: true, schema: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], example: 'B+' } },
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number', example: 22.3039 } },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number', example: 70.8022 } },
          { name: 'radius', in: 'query', schema: { type: 'number', default: 30, example: 30 } },
        ],
        responses: { 200: { description: 'Emergency hospitals with available blood units sorted by distance' } },
      },
    },
    '/hospitals/{hospitalId}/blood-inventory': {
      get: {
        tags: ['Emergency Blood'],
        summary: 'Get hospital blood inventory status',
        parameters: [{ name: 'hospitalId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Hospital blood inventory' } },
      },
      post: {
        tags: ['Emergency Blood'],
        security: [{ BearerAuth: [] }],
        summary: 'Add or update blood group inventory (Staff/Admin)',
        parameters: [{ name: 'hospitalId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bloodGroup', 'availableUnits'],
                properties: {
                  bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                  availableUnits: { type: 'number', example: 4 },
                  status: { type: 'string', enum: ['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Blood inventory record saved' } },
      },
    },
    '/hospitals/{hospitalId}/blood-inventory/{bloodGroup}': {
      patch: {
        tags: ['Emergency Blood'],
        security: [{ BearerAuth: [] }],
        summary: 'Update available units & status for a specific blood group (Staff/Admin)',
        parameters: [
          { name: 'hospitalId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'bloodGroup', in: 'path', required: true, schema: { type: 'string', example: 'B+' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['availableUnits'],
                properties: {
                  availableUnits: { type: 'number', example: 5 },
                  status: { type: 'string', enum: ['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Blood group units updated' } },
      },
    },
    '/tokens': {
      post: {
        tags: ['Tokens'],
        security: [{ BearerAuth: [] }],
        summary: 'Request OPD token for hospital doctor',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['hospitalId', 'doctorId'],
                properties: {
                  hospitalId: { type: 'string' },
                  doctorId: { type: 'string' },
                  appointmentId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Token generated successfully' } },
      },
    },
    '/tokens/my': {
      get: {
        tags: ['Tokens'],
        security: [{ BearerAuth: [] }],
        summary: 'Get patient token history',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'upcoming', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { 200: { description: 'Patient token list' } },
      },
    },
    '/tokens/{tokenId}': {
      get: {
        tags: ['Tokens'],
        security: [{ BearerAuth: [] }],
        summary: 'Get token details & current queue status',
        parameters: [{ name: 'tokenId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Token queue status' } },
      },
    },
    '/tokens/hospitals/{hospitalId}/doctors/{doctorId}/queue': {
      get: {
        tags: ['Tokens'],
        summary: "Get today's doctor queue summary",
        parameters: [
          { name: 'hospitalId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Queue status details' } },
      },
    },
    '/tokens/{tokenId}/status': {
      patch: {
        tags: ['Tokens'],
        security: [{ BearerAuth: [] }],
        summary: 'Update token status (Staff/Admin)',
        parameters: [{ name: 'tokenId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Token status updated' } },
      },
    },
    '/tokens/hospitals/{hospitalId}/doctors/{doctorId}/queue/next': {
      patch: {
        tags: ['Tokens'],
        security: [{ BearerAuth: [] }],
        summary: 'Call next WAITING patient in doctor OPD queue (Staff/Admin)',
        parameters: [
          { name: 'hospitalId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Next patient called' } },
      },
    },
    '/teleconsultations': {
      post: {
        tags: ['Teleconsultation'],
        security: [{ BearerAuth: [] }],
        summary: 'Request a teleconsultation with doctor',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['doctorId', 'hospitalId', 'reason'],
                properties: {
                  doctorId: { type: 'string' },
                  hospitalId: { type: 'string' },
                  appointmentId: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Teleconsultation requested' } },
      },
    },
    '/teleconsultations/my': {
      get: {
        tags: ['Teleconsultation'],
        security: [{ BearerAuth: [] }],
        summary: 'Get patient teleconsultation history',
        responses: { 200: { description: 'Patient teleconsultation list' } },
      },
    },
    '/teleconsultations/{consultationId}': {
      get: {
        tags: ['Teleconsultation'],
        security: [{ BearerAuth: [] }],
        summary: 'Get teleconsultation details & messages',
        parameters: [{ name: 'consultationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Teleconsultation record and messages' } },
      },
    },
    '/teleconsultations/{consultationId}/accept': {
      patch: {
        tags: ['Teleconsultation'],
        security: [{ BearerAuth: [] }],
        summary: 'Accept consultation request (Doctor/Staff)',
        parameters: [{ name: 'consultationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Consultation accepted' } },
      },
    },
    '/teleconsultations/{consultationId}/reject': {
      patch: {
        tags: ['Teleconsultation'],
        security: [{ BearerAuth: [] }],
        summary: 'Reject consultation request (Doctor/Staff)',
        parameters: [{ name: 'consultationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Consultation rejected' } },
      },
    },
    '/teleconsultations/{consultationId}/start': {
      patch: {
        tags: ['Teleconsultation'],
        security: [{ BearerAuth: [] }],
        summary: 'Start consultation session (Doctor/Staff)',
        parameters: [{ name: 'consultationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Consultation active' } },
      },
    },
    '/teleconsultations/{consultationId}/end': {
      patch: {
        tags: ['Teleconsultation'],
        security: [{ BearerAuth: [] }],
        summary: 'End consultation session (Doctor/Staff)',
        parameters: [{ name: 'consultationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Consultation completed' } },
      },
    },
    '/teleconsultations/{consultationId}/messages': {
      post: {
        tags: ['Teleconsultation'],
        security: [{ BearerAuth: [] }],
        summary: 'Send chat message in consultation session',
        parameters: [{ name: 'consultationId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Message stored' } },
      },
    },
    '/ai/symptom-analysis': {
      post: {
        tags: ['Voice AI'],
        security: [{ BearerAuth: [] }],
        summary: 'Analyze symptoms text/voice input for preliminary condition & red flags',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['symptomsText'],
                properties: {
                  symptomsText: { type: 'string', example: 'Fever, cough, throat pain for 2 days' },
                  duration: { type: 'string', example: '2 days' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Preliminary assessment generated' } },
      },
    },
    '/ai/history': {
      get: {
        tags: ['Voice AI'],
        security: [{ BearerAuth: [] }],
        summary: 'Get patient symptom assessment history',
        responses: { 200: { description: 'Previous AI symptom analyses' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  name: { type: 'string', example: 'Ramesh Patel' },
                  role: { type: 'string', enum: ['USER', 'ADMIN', 'HOSPITAL_STAFF'], default: 'USER' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'User registered successfully' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login to receive access & refresh JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@healthcare.gov.in' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Login successful' } },
      },
    },
    '/hospitals/nearby': {
      get: {
        tags: ['Hospitals'],
        summary: 'Location-wise Hospital Availability (Radius Search)',
        parameters: [
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number', example: 22.3039 } },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number', example: 70.8022 } },
          { name: 'radius', in: 'query', schema: { type: 'number', default: 10, example: 15 } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'SUB_CENTER', 'OTHER'] } },
          { name: 'emergency', in: 'query', schema: { type: 'boolean', example: true } },
          { name: 'service', in: 'query', schema: { type: 'string', example: 'Gynecology' } },
        ],
        responses: { 200: { description: 'Nearby hospitals sorted by distance ascending' } },
      },
    },
    '/facilities/nearest': {
      get: {
        tags: ['Facilities'],
        summary: 'Nearest Medical Facility Locator (by service/emergency)',
        parameters: [
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number', example: 22.3039 } },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number', example: 70.8022 } },
          { name: 'service', in: 'query', schema: { type: 'string', example: 'Gynecology' } },
          { name: 'facilityType', in: 'query', schema: { type: 'string' } },
          { name: 'emergency', in: 'query', schema: { type: 'boolean', example: true } },
        ],
        responses: { 200: { description: 'Nearest suitable medical facility' } },
      },
    },
    '/hospitals': {
      get: {
        tags: ['Hospitals'],
        summary: 'Get all hospitals with filters',
        parameters: [
          { name: 'district', in: 'query', schema: { type: 'string', example: 'Rajkot' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'emergency', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Hospital list' } },
      },
      post: {
        tags: ['Hospitals'],
        security: [{ BearerAuth: [] }],
        summary: 'Add/Create a new hospital (Admin / District Admin / Super Admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type', 'address', 'district', 'state', 'pincode', 'latitude', 'longitude', 'phone'],
                properties: {
                  name: { type: 'string', example: 'Community Health Centre AIIMS' },
                  type: { type: 'string', enum: ['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'SUB_CENTER', 'OTHER'], example: 'CHC' },
                  address: { type: 'string', example: 'Kalavad Road' },
                  district: { type: 'string', example: 'Rajkot' },
                  state: { type: 'string', example: 'Gujarat' },
                  pincode: { type: 'string', example: '360005' },
                  latitude: { type: 'number', example: 22.3039 },
                  longitude: { type: 'number', example: 70.8022 },
                  phone: { type: 'string', example: '+91 281 2345678' },
                  email: { type: 'string', example: 'chc.rajkot@health.gov.in' },
                  openingTime: { type: 'string', example: '08:00 AM' },
                  closingTime: { type: 'string', example: '08:00 PM' },
                  emergencyAvailable: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Hospital created successfully' } },
      },
    },
    '/hospitals/{hospitalId}': {
      get: {
        tags: ['Hospitals'],
        summary: 'Get hospital by ID',
        parameters: [{ name: 'hospitalId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Hospital details' } },
      },
      put: {
        tags: ['Hospitals'],
        security: [{ BearerAuth: [] }],
        summary: 'Update hospital details (Admin / District Admin / Super Admin)',
        parameters: [{ name: 'hospitalId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'SUB_CENTER', 'OTHER'] },
                  address: { type: 'string' },
                  district: { type: 'string' },
                  state: { type: 'string' },
                  pincode: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  openingTime: { type: 'string' },
                  closingTime: { type: 'string' },
                  emergencyAvailable: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Hospital updated successfully' } },
      },
      delete: {
        tags: ['Hospitals'],
        security: [{ BearerAuth: [] }],
        summary: 'Remove / delete hospital (Admin / District Admin / Super Admin)',
        parameters: [{ name: 'hospitalId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Hospital deleted successfully' } },
      },
    },
    '/doctors': {
      get: {
        tags: ['Doctors'],
        summary: 'Get doctors list',
        parameters: [
          { name: 'specialization', in: 'query', schema: { type: 'string', example: 'General Physician' } },
          { name: 'hospitalId', in: 'query', schema: { type: 'string' } },
          { name: 'availabilityStatus', in: 'query', schema: { type: 'string', enum: ['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE', 'UNKNOWN'] } },
        ],
        responses: { 200: { description: 'Doctor directory list' } },
      },
      post: {
        tags: ['Doctors'],
        security: [{ BearerAuth: [] }],
        summary: 'Add/Create a new doctor (Admin / Staff)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['hospitalId', 'name', 'specialization', 'qualification', 'phone'],
                properties: {
                  hospitalId: { type: 'string', example: 'hospital_id_here' },
                  name: { type: 'string', example: 'Dr. Rajesh Sharma' },
                  specialization: { type: 'string', example: 'Cardiology' },
                  qualification: { type: 'string', example: 'MBBS, MD' },
                  phone: { type: 'string', example: '+91 9876543210' },
                  consultationStart: { type: 'string', example: '09:00 AM' },
                  consultationEnd: { type: 'string', example: '05:00 PM' },
                  availabilityStatus: { type: 'string', enum: ['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE', 'UNKNOWN'], default: 'AVAILABLE' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Doctor created successfully' } },
      },
    },
    '/doctors/{doctorId}': {
      get: {
        tags: ['Doctors'],
        summary: 'Get doctor by ID',
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Doctor detail record' } },
      },
      put: {
        tags: ['Doctors'],
        security: [{ BearerAuth: [] }],
        summary: 'Update doctor details (Admin / Staff)',
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  specialization: { type: 'string' },
                  qualification: { type: 'string' },
                  phone: { type: 'string' },
                  consultationStart: { type: 'string' },
                  consultationEnd: { type: 'string' },
                  availabilityStatus: { type: 'string', enum: ['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE', 'UNKNOWN'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Doctor updated successfully' } },
      },
      delete: {
        tags: ['Doctors'],
        security: [{ BearerAuth: [] }],
        summary: 'Remove / delete doctor (Admin / Super Admin)',
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Doctor deleted successfully' } },
      },
    },
    '/doctors/available': {
      get: {
        tags: ['Doctors'],
        summary: 'Get currently available doctors for booking',
        parameters: [
          { name: 'hospitalId', in: 'query', schema: { type: 'string' } },
          { name: 'specialization', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Available doctors' } },
      },
    },
    '/doctors/{doctorId}/slots': {
      get: {
        tags: ['Appointments'],
        summary: 'Get available & booked time slots for a doctor on a specific date',
        parameters: [
          { name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', example: '2026-09-15' } },
        ],
        responses: { 200: { description: 'Slots list (AVAILABLE / BOOKED)' } },
      },
    },
    '/appointments': {
      post: {
        tags: ['Appointments'],
        security: [{ BearerAuth: [] }],
        summary: 'Book a doctor appointment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['doctorId', 'hospitalId', 'appointmentDate', 'timeSlot', 'reason'],
                properties: {
                  doctorId: { type: 'string', example: 'doctor_id_here' },
                  hospitalId: { type: 'string', example: 'hospital_id_here' },
                  appointmentDate: { type: 'string', example: '2026-09-15' },
                  timeSlot: { type: 'string', example: '10:30' },
                  reason: { type: 'string', example: 'Fever and general checkup' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Appointment created successfully' } },
      },
    },
    '/appointments/my': {
      get: {
        tags: ['Appointments'],
        security: [{ BearerAuth: [] }],
        summary: 'Get logged-in patient\'s booked appointments',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'] } },
          { name: 'upcoming', in: 'query', schema: { type: 'boolean' } },
          { name: 'past', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { 200: { description: 'List of patient appointments' } },
      },
    },
    '/appointments/{appointmentId}': {
      get: {
        tags: ['Appointments'],
        security: [{ BearerAuth: [] }],
        summary: 'Get appointment details by ID',
        parameters: [{ name: 'appointmentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Appointment detail record' } },
      },
    },
    '/appointments/{appointmentId}/cancel': {
      patch: {
        tags: ['Appointments'],
        security: [{ BearerAuth: [] }],
        summary: 'Cancel an appointment (Patient)',
        parameters: [{ name: 'appointmentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Appointment cancelled successfully' } },
      },
    },
    '/medicines': {
      get: {
        tags: ['Medicines'],
        summary: 'Search medicine catalog',
        parameters: [{ name: 'search', in: 'query', schema: { type: 'string', example: 'Paracetamol' } }],
        responses: { 200: { description: 'Medicine master catalog list' } },
      },
    },
    '/medicines/{medicineId}/availability': {
      get: {
        tags: ['Medicines'],
        summary: 'Check medicine stock availability by user location',
        parameters: [
          { name: 'medicineId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'latitude', in: 'query', required: true, schema: { type: 'number', example: 22.3039 } },
          { name: 'longitude', in: 'query', required: true, schema: { type: 'number', example: 70.8022 } },
          { name: 'radius', in: 'query', schema: { type: 'number', default: 20, example: 30 } },
        ],
        responses: { 200: { description: 'List of stocking facilities sorted by distance' } },
      },
    },
    '/admin/appointments': {
      get: {
        tags: ['Admin'],
        security: [{ BearerAuth: [] }],
        summary: 'Get all appointments (Admin/Staff)',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'date', in: 'query', schema: { type: 'string' } },
          { name: 'hospitalId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'All system appointments' } },
      },
    },
    '/admin/appointments/{appointmentId}/status': {
      patch: {
        tags: ['Admin'],
        security: [{ BearerAuth: [] }],
        summary: 'Update appointment status (Admin/Staff)',
        parameters: [{ name: 'appointmentId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'], example: 'COMPLETED' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Appointment status updated' } },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount main API v1 router
app.use('/api/v1', apiRoutes);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
