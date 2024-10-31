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
let isTotalLoading = true;
let isPageLoading = false;

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
    _count: 15,
    _offset: page * 15,
    _total: 'accurate'
  };

  // Add search parameters if they exist
  if (searchLastName.trim()) {
    params['name:contains'] = searchLastName.trim();
  }
  if (searchBirthDate) {
    params['birthdate:eq'] = searchBirthDate;
  }

  try {
    isTotalLoading = true;
    error = null;
    const patientResponse = await fhirApi.get('/Patient', { params });
    const patients = patientResponse.data;
    
    // Handle different server responses for total
    if (selectedServer === FHIR_SERVERS.KODJIN) {
      // For Kodjin, if total is not available, use the entry length as fallback
      totalPatients = patients.total || (patients.entry?.length || 0);
    } else {
      totalPatients = patients.total;
    }

    return patients;
  } catch (err) {
    console.error('Search error:', err);
    error = 'Failed to fetch patients. Please try again.';
    throw err;
  } finally {
    isTotalLoading = false;
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
  try {
    isPageLoading = true;
    patients = await fetchPatients(newPage);
    page = newPage;
  } catch (error) {
    console.error('Error changing page:', error);
  } finally {
    isPageLoading = false;
  }
};

</script>

<main>
  <div class="w-full my-10">
    <hr class="border-[#2B57AD]/50 my-2">
    <div class="flex justify-center items-center my-1">
      <h1 class="text-2xl text-[#2B57AD] font-semibold">PATIENT ROSTER</h1>
    </div>
    <hr class="border-[#2B57AD]/50 my-2">
    <div class="my-4 flex gap-4 items-end justify-between">
      <div class="flex gap-4 items-end">
        <div class="flex flex-col">
          <label for="lastName" class="text-sm mb-1 text-[#2B57AD] font-medium">Last Name</label>
          <input
            type="text"
            id="lastName"
            bind:value={searchLastName}
            class="border-2 border-[#2B57AD]/20 p-2 rounded focus:border-[#2B57AD]/50 focus:outline-none"
            placeholder="Search by last name"
          />
        </div>
        
        <div class="flex flex-col">
          <label for="birthDate" class="text-sm mb-1 text-[#2B57AD] font-medium">Birth Date</label>
          <input
            type="date"
            id="birthDate"
            bind:value={searchBirthDate}
            class="border-2 border-[#2B57AD]/20 p-2 rounded focus:border-[#2B57AD]/50 focus:outline-none"
          />
        </div>
        
        <button
          class="bg-[#2B57AD] hover:bg-[#2B57AD]/90 text-white p-2 px-4 rounded transition-colors"
          on:click={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>

        <button
          class="bg-[#F57B17] hover:bg-[#F57B17]/90 text-white p-2 px-4 rounded transition-colors"
          on:click={resetSearch}
        >
          Reset
        </button>

        <button 
          class="bg-[#B91F3B] hover:bg-[#B91F3B]/90 text-white p-2 px-4 rounded transition-colors"
          on:click={() => navigate('/patient/create')}
        >
          CREATE PATIENT
        </button>
      </div>

      <div class="flex gap-4 items-center">
        <span class="text-[#2B57AD] font-medium">Total Patients: {totalPatients}</span>
        <label class="flex items-center">
          <input
            type="radio"
            name="server"
            value={FHIR_SERVERS.MEDBLOCKS}
            checked={selectedServer === FHIR_SERVERS.MEDBLOCKS}
            on:change={() => handleServerChange(FHIR_SERVERS.MEDBLOCKS)}
            class="mr-2 accent-[#2B57AD]"
          />
          <span class="text-[#2B57AD]">Medblocks</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            name="server"
            value={FHIR_SERVERS.HAPI}
            checked={selectedServer === FHIR_SERVERS.HAPI}
            on:change={() => handleServerChange(FHIR_SERVERS.HAPI)}
            class="mr-2 accent-[#2B57AD]"
          />
          <span class="text-[#2B57AD]">HAPI FHIR</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            name="server"
            value={FHIR_SERVERS.KODJIN}
            checked={selectedServer === FHIR_SERVERS.KODJIN}
            on:change={() => handleServerChange(FHIR_SERVERS.KODJIN)}
            class="mr-2 accent-[#2B57AD]"
          />
          <span class="text-[#2B57AD]">Kodjin</span>
        </label>
      </div>
    </div>
    {#if !patients || isPageLoading}
      <p class="text-[#2B57AD] animate-pulse text-center my-4">Loading...</p>
    {:else if !patients.entry?.length}
      <p class="text-[#F57B17] mt-4">No patients found.</p>
    {:else}
      <table class="w-full mt-2">
        <thead>
          <tr class="text-left border-b-2 border-[#2B57AD]/30">
            <th class="p-2 text-[#2B57AD] font-semibold">ID</th>
            <th class="p-2 w-10"></th>
            <th class="p-2 text-[#2B57AD] font-semibold">Name</th>
            <th class="p-2 text-[#2B57AD] font-semibold">Gender</th>
            <th class="p-2 text-[#2B57AD] font-semibold">Birth Date</th>
          </tr>
        </thead>
        <tbody>
          {#each patients.entry as patient}
            <tr class="border-b border-[#2B57AD]/10 hover:bg-[#2B57AD]/5 transition-colors">
              <td class="p-2">{patient?.resource?.id}</td>
              <td class="p-2 pr-0">
                <button 
                  class="text-[#2B57AD] hover:text-[#2B57AD]/80 transition-colors"
                  on:click={() => navigate(`/patient/edit/${patient.resource.id}`)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.793 8.793-3.536 1.414 1.414-3.536 8.793-8.793z" />
                  </svg>
                </button>
              </td>
              <td class="p-2 pl-0">{formatName(patient?.resource)}</td>
              <td class="p-2">{formatGender(patient?.resource?.gender)}</td>
              <td class="p-2">{formatDate(patient?.resource?.birthDate)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
    <div class="mt-4">
      <button 
        class={clsx("p-2 px-4 text-white rounded transition-colors", {
          'bg-[#2B57AD] hover:bg-[#2B57AD]/90': page > 0,
          'bg-gray-300': page === 0
        })} 
        on:click={() => handlePageChange(page - 1)} 
        disabled={page === 0 || isPageLoading}
      >
        {isPageLoading ? 'Loading...' : 'Previous'}
      </button>
      <span class="mx-4 text-[#2B57AD] font-medium">Page {page + 1}</span>
      <button 
        class={clsx("p-2 px-4 text-white rounded transition-colors", {
          'bg-[#2B57AD] hover:bg-[#2B57AD]/90': (page + 1) * 15 < totalPatients,
          'bg-gray-300': (page + 1) * 15 >= totalPatients
        })} 
        on:click={() => handlePageChange(page + 1)} 
        disabled={(page + 1) * 15 >= totalPatients || isPageLoading}
      >
        {isPageLoading ? 'Loading...' : 'Next'}
      </button>
    </div>
    {#if error}
      <div class="text-[#B91F3B] mt-4 font-medium">{error}</div>
    {/if}
    
    <!-- Add copyright text -->
    <div class="text-center text-[#2B57AD]/60 mt-8">
      © Not Copyrighted 2024. All rights are yours.
    </div>
  </div>
</main>
