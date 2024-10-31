import axios from 'axios'

export const FHIR_SERVERS = {
  MEDBLOCKS: 'https://fhir-bootcamp.medblocks.com/fhir',
  HAPI: 'https://hapi.fhir.org/baseR4',
  KODJIN: 'https://demo.kodjin.com/fhir/'
} as const;

// Set default server
export const DEFAULT_FHIR_SERVER = FHIR_SERVERS.MEDBLOCKS;

export const fhirApi = axios.create({
  baseURL: DEFAULT_FHIR_SERVER,
  headers: {
    'Cache-Control': 'no-cache',
    'Accept': 'application/fhir+json',
    'Content-Type': 'application/fhir+json'
  }
});

export const setFhirServer = (server: string) => {
  // Your server setting logic here
  fhirApi.defaults.baseURL = server;
};