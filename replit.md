# Creaciones - Subdirección Cobertura de Cargos

## Overview
This is a management platform for educational institution records (expedientes). It allows users to create, read, update, and delete expedientes for the "Subdirección Cobertura de Cargos" department.

## Recent Changes
- 2026-01-01: Initial implementation of the platform with full CRUD functionality
- 2026-01-01: Added institutional design with dark blue, gray, and white color scheme
- 2026-01-01: Implemented dark/light mode toggle
- 2026-01-01: Added filters, search, and pagination functionality

## Project Architecture

### Frontend (client/)
- **Framework**: React with TypeScript
- **Routing**: wouter
- **Styling**: Tailwind CSS with custom institutional theme
- **State Management**: TanStack Query for server state
- **UI Components**: shadcn/ui components
- **Forms**: react-hook-form with Zod validation

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage)
- **Validation**: Zod schemas

### Shared (shared/)
- **schema.ts**: Data models, types, and validation schemas

## Key Features
1. **Expediente Management**: Create, edit, delete, and view expedientes
2. **Search**: Filter expedientes by text (expediente number, establishment, or comment)
3. **Filters**: Filter by Estado and Tipo de Solicitud
4. **Pagination**: 10 items per page with navigation controls
5. **Statistics**: Dashboard counters showing total, in progress, pending, and approved expedientes
6. **Dark/Light Mode**: Toggle between themes
7. **Responsive Design**: Works on desktop, tablet, and mobile

## Data Models

### Expediente
- `id`: UUID (auto-generated)
- `expediente`: String (format: 1234567/26)
- `solicita`: SolicitudType (25 types)
- `establecimiento`: String
- `estado`: EstadoType (12 states)
- `comentario`: String (optional)

### Nomenclador de Solicitud (25 types)
- CIERRE PROVISORIO DE ESTABLECIMIENTO
- CIERRE DE DIVISIONES
- CAMBIO DE ESTRUCTURA CURRICULAR
- (... and 22 more types)

### Nomenclador de Estados (12 states)
- INICIAL, SECUNDARIO, OBLIGATORIA, LIQUIDACIONES
- LEGAL Y TÉCNICA, DESPACHO, INNOVACIÓN, INFRAESTRUCTURA
- GESTIÓN, HACIENDA, FIRMA MINISTRO, FIRMA INT.

## API Endpoints
- `GET /api/expedientes` - List all expedientes
- `GET /api/expedientes/:id` - Get single expediente
- `POST /api/expedientes` - Create new expediente
- `PUT /api/expedientes/:id` - Update expediente
- `DELETE /api/expedientes/:id` - Delete expediente

## Running the Project
The application runs with `npm run dev` which starts:
- Express backend server on port 5000
- Vite dev server for frontend (proxied through Express)

## Design Guidelines
The application follows institutional design guidelines:
- Primary Color: Dark Blue (#1e3a8a)
- Secondary Color: Gray (#6b7280)
- Background: White (#ffffff)
- Typography: Roboto font family
- See `design_guidelines.md` for full details
