# Patient Roster Management System

A modern, responsive web application for managing patient records using FHIR (Fast Healthcare Interoperability Resources) standards.

## Author
Ajay Prashar

## Description
This application provides a comprehensive interface for healthcare providers to manage patient records. Built with Svelte and TypeScript, it offers seamless integration with FHIR servers (Medblocks and HAPI FHIR) for robust healthcare data management.

### Key Features
- **Patient List View**: Display paginated list of patients with search capabilities
- **Create Patient**: Add new patients with validation for:
  - Names (capitalization rules)
  - Birth dates
  - Gender selection
  - Phone numbers (formatted input)
- **Edit Patient**: Modify existing patient records
- **Delete Patient**: Remove patient records with confirmation
- **Server Selection**: Toggle between Medblocks and HAPI FHIR servers
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
The application integrates with two FHIR servers:
- Medblocks: `https://fhir-bootcamp.medblocks.com/fhir`
- HAPI FHIR: `https://hapi.fhir.org/baseR4`

## License
Not copyrighted 2024. All rights are yours.
