<script lang="ts">
  import { fhirApi, setFhirServer, FHIR_SERVERS, DEFAULT_FHIR_SERVER } from "./api";
  import type {Patient} from "fhir/r4";
  import clsx from "clsx";
  import {Router, Route, Link, navigate} from "svelte-routing";
  import { onMount } from 'svelte';

let page: number = 0
let totalPatients: number = 0
let searchLastName: string = ''
let searchBirthDate: string = ''

let selectedServer: string = DEFAULT_FHIR_SERVER;
let patients: any = null;
let error: string | null = null;
let isLoading = false;

// Add initial load
const initializePatients = async () => {
  patients = await fetchPatients(0);
};

// Call initialize on component mount
onMount(() => {
  initializePatients();
});

const fetchPatients = async (page: number) => {
  const params: Record<string, any> = {
    _sort: '-_lastUpdated',
    _count: 20,
    _offset: page * 20,
    _total: 'accurate'
  };

  // Always include search parameters if they exist, not just during search
  if (searchLastName.trim()) {
    params['name:contains'] = searchLastName.trim();
  }
  if (searchBirthDate) {
    params['birthdate:eq'] = searchBirthDate;
  }

  try {
    error = null;
    const patientResponse = await fhirApi.get('/Patient', { params });
    const patients = patientResponse.data;
    totalPatients = patients.total;
    console.log('Search params:', params);
    console.log('Response:', patients);
    return patients;
  } catch (err) {
    console.error('Search error:', err);
    error = 'Failed to fetch patients. Please try again.';
    throw err;
  }
}

const formatName = (resource: Patient) => {
  const firstNameElement = resource.name?.[0]
  const firstName = firstNameElement?.given?.join(' ')
  const lastName = firstNameElement?.family

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName && !lastName) {
    return `${firstName} (Missing Last Name)`;
  } else if (!firstName && lastName) {
    return `${lastName} (Missing First Name)`;
  } else {
    return 'Both First and Last Names Missing';
  }
}

const formatGender = (gender: string | undefined) => {
  if (!gender) return 'Gender Unknown';
  
  // Convert to uppercase for consistent comparison
  const normalizedGender = gender.toUpperCase();
  
  if (['MALE', 'M'].includes(normalizedGender)) {
    return 'Male';
  } else if (['FEMALE', 'F'].includes(normalizedGender)) {
    return 'Female';
  } else {
    return 'Unknown';
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  // FHIR dates are already in YYYY-MM-DD format, but this ensures consistency
  // and handles any cases where a full timestamp might be present
  return dateString.split('T')[0];
}

const handleSearch = async () => {
  isLoading = true;
  try {
    page = 0;
    patients = await fetchPatients(page);
  } finally {
    isLoading = false;
  }
}

const resetSearch = async () => {
  searchLastName = '';
  searchBirthDate = '';
  page = 0;
  patients = await fetchPatients(page);
}

// Update server change handler to use initializePatients
const handleServerChange = async (newServer: string) => {
  isLoading = true;
  try {
    selectedServer = newServer;
    setFhirServer(newServer);
    page = 0;
    await initializePatients();
  } finally {
    isLoading = false;
  }
};

// Add a page change handler
const handlePageChange = async (newPage: number) => {
  page = newPage;
  patients = await fetchPatients(page);
};

</script>

<main>
  <div class="w-full my-10">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl text-black dark:text-white font-semibold underline">PATIENT ROSTER</h1>
    </div>
    <div class="my-4 flex gap-4 items-end justify-between">
      <div class="flex gap-4 items-end">
        <div class="flex flex-col">
          <label for="lastName" class="text-sm mb-1">Last Name</label>
          <input
            type="text"
            id="lastName"
            bind:value={searchLastName}
            class="border p-2 rounded"
            placeholder="Search by last name"
          />
        </div>
        
        <div class="flex flex-col">
          <label for="birthDate" class="text-sm mb-1">Birth Date</label>
          <input
            type="date"
            id="birthDate"
            bind:value={searchBirthDate}
            class="border p-2 rounded"
          />
        </div>
        
        <button
          class="bg-black text-white p-2 rounded"
          on:click={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>

        <button
          class="bg-gray-300 text-black p-2 rounded"
          on:click={resetSearch}
        >
          Reset
        </button>

        <button 
          class="bg-black text-white p-2 rounded"
          on:click={() => navigate('/patient/create')}
        >
          CREATE PATIENT
        </button>
      </div>

      <div class="flex gap-4 items-center">
        <span class="text-gray-600">Total Patients: {totalPatients}</span>
        <label class="flex items-center">
          <input
            type="radio"
            name="server"
            value={FHIR_SERVERS.MEDBLOCKS}
            checked={selectedServer === FHIR_SERVERS.MEDBLOCKS}
            on:change={() => handleServerChange(FHIR_SERVERS.MEDBLOCKS)}
            class="mr-2"
          />
          Medblocks
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            name="server"
            value={FHIR_SERVERS.HAPI}
            checked={selectedServer === FHIR_SERVERS.HAPI}
            on:change={() => handleServerChange(FHIR_SERVERS.HAPI)}
            class="mr-2"
          />
          HAPI FHIR
        </label>
      </div>
    </div>
    {#if !patients}
      Loading...
    {:else if !patients.entry?.length}
      <p class="text-gray-500 mt-4">No patients found.</p>
    {:else}
      <table class="w-full mt-4">
        <thead>
          <tr class="text-left border-b">
            <th class="p-2">ID</th>
            <th class="p-2">Name</th>
            <th class="p-2">Gender</th>
            <th class="p-2">Birth Date</th>
          </tr>
        </thead>
        <tbody>
          {#each patients.entry as patient}
            <tr class="border-b hover:bg-gray-50">
              <td class="p-2">{patient?.resource?.id}</td>
              <td class="p-2">{formatName(patient?.resource)}</td>
              <td class="p-2">{formatGender(patient?.resource?.gender)}</td>
              <td class="p-2">{formatDate(patient?.resource?.birthDate)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
    <div class="mt-4">
      <button 
        class={clsx("p-2 text-white", {
          'bg-black': page > 0,
          'bg-gray-300': page === 0
        })} 
        on:click={() => handlePageChange(page - 1)} 
        disabled={page === 0}
      >
        Previous
      </button>
      <span class="mx-4">Page {page + 1}</span>
      <button 
        class={clsx("p-2 text-white", {
          'bg-black': (page + 1) * 20 < totalPatients,
          'bg-gray-300': (page + 1) * 20 >= totalPatients
        })} 
        on:click={() => handlePageChange(page + 1)} 
        disabled={(page + 1) * 20 >= totalPatients}
      >
        Next
      </button>
    </div>
    {#if error}
      <div class="text-red-500 mt-4">{error}</div>
    {/if}
  </div>
</main>
