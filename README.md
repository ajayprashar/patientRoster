# Patient Roster Management System

A modern, responsive web application for managing patient records using FHIR (Fast Healthcare Interoperability Resources) standards.

## Technical Overview

### Architecture
- **SPA Architecture**: Built as a Single Page Application using Svelte and TypeScript
- **Component Structure**:
  - `App.svelte`: Root component with routing configuration
  - `PatientList.svelte`: Main dashboard with real-time search and pagination
  - `PatientCreate.svelte`: Form component with validation
  - `PatientEdit.svelte`: Combined form/view with delete capabilities
  - `PatientView.svelte`: Read-only patient details
  - `About.svelte`: Architecture documentation with Mermaid diagrams

### Core Features
1. **FHIR Integration**
   - Multiple server support (MEDBLOCKS, HAPI, KODJIN)
   - RESTful operations using Axios
   - Server-side pagination with `_count` and `_offset`
   - Real-time server switching with state persistence

2. **Data Management**
   - Patient search with server-specific query parameters
   - Optimistic updates with refresh delays
   - Error handling with retry mechanisms
   - Session storage for state persistence

3. **Form Handling**
   - Real-time validation with regex patterns
   - Phone number formatting (XXX-XXX-XXXX)
   - Name capitalization rules
   - Gender normalization (M/F/U to male/female/unknown)

4. **UI/UX Features**
   - Responsive Tailwind CSS design
   - Loading states with animations
   - Error messaging system
   - Confirmation dialogs for destructive actions
   - Real-time Kolkata time display
   - Dynamic age calculation

### Data Flow
1. **Patient List**
   ```typescript
   // Fetch flow with retry mechanism
   const fetchPatients = async (page: number) => {
     let retryCount = 0;
     while (retryCount < maxRetries) {
       try {
         const params = {
           _sort: '-_lastUpdated',
           _count: 15,
           _offset: page * 15,
           _total: 'accurate'
         };
         const response = await fhirApi.get('/Patient', { params });
         return response.data;
       } catch (err) {
         retryCount++;
         await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
       }
     }
   };
   ```

2. **Server Switching**
   ```typescript
   // Server state management
   const handleServerChange = async (server: string) => {
     setFhirServer(server);
     sessionStorage.setItem('selectedServer', server);
     await fetchTotalCount();
     await initializePatients();
   };
   ```

### API Integration Details
- **Base URLs**:
  - MEDBLOCKS: `https://fhir-bootcamp.medblocks.com/fhir`
  - HAPI: `https://hapi.fhir.org/baseR4`
  - KODJIN: `https://demo.kodjin.com/fhir/`
- **Headers**:
  ```typescript
  headers: {
    'Cache-Control': 'no-cache',
    'Accept': 'application/fhir+json',
    'Content-Type': 'application/fhir+json'
  }
  ```

### State Management
- Server selection persisted in SessionStorage
- Patient creation status tracking
- Form validation states
- Loading states for various operations

### Performance Optimizations
- Debounced search
- Pagination with fixed page size
- Optimistic updates
- Error retry mechanism
- Cached server selection

### Error Handling
- Network request retries
- Form validation feedback
- Server error messages
- Delete confirmation
- Loading state management

## Development Setup

## Author
Ajay Prashar

## Description
This application provides a comprehensive interface for healthcare providers to manage patient records. Built with Svelte and TypeScript, it offers seamless integration with FHIR servers (Medblocks and HAPI) for robust healthcare data management.

### Key Features
- **Patient List View**: Display paginated list of patients with search capabilities
- **Create Patient**: Add new patients with validation for:
  - Names (capitalization rules)
  - Birth dates
  - Gender selection
  - Phone numbers (formatted input)
- **Edit Patient**: Modify existing patient records
- **Delete Patient**: Remove patient records with confirmation
- **Server Selection**: Toggle between Medblocks and HAPI servers
- **Responsive Design**: Modern UI with consistent styling

## Technical Stack
- **Frontend Framework**: Svelte
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: Svelte Routing
- **API**: FHIR R4

## Installation
1. Clone the repository

2. Install dependencies

3. Start the development server

## Usage
The application provides three main views:
1. **Patient List**: Main dashboard showing all patients
   - Search by last name
   - Filter by birth date
   - Pagination controls
   - Server selection

2. **Create Patient**: Form to add new patients
   - Required fields marked with *
   - Real-time validation
   - Phone number formatting

3. **Edit Patient**: Modify existing patient records
   - Pre-populated form
   - Delete capability
   - Validation rules maintained

## API Integration
The application integrates with three FHIR servers:
- Medblocks: `https://fhir-bootcamp.medblocks.com/fhir`
- HAPI: `https://hapi.fhir.org/baseR4`
- Kodjin: `https://demo.kodjin.com/fhir/` (Note: Total patient count might be limited)

## License
Not copyrighted 2024. All rights are yours.
