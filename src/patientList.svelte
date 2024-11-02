<script lang="ts">
  export let kolkataTime: string;
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

// Add a loading state specifically for server changes
let isServerChanging = false;

// Add initial load
const initializePatients = async () => {
  patients = await fetchPatients(0);
};

// Call initialize on component mount
onMount(async () => {
  const wasCreated = sessionStorage.getItem('patientCreated');
  // Restore selected server from session storage
  const savedServer = sessionStorage.getItem('selectedServer');
  if (savedServer) {
    selectedServer = savedServer;
    setFhirServer(savedServer);
  }
  
  try {
    // First fetch the total count
    await fetchTotalCount();
    
    if (wasCreated) {
      sessionStorage.removeItem('patientCreated');
      // Initial delay for server sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      await initializePatients();
      // Second refresh after additional delay
      setTimeout(async () => {
        await initializePatients();
      }, 2000);
    } else {
      await initializePatients();
    }
  } finally {
    // Make sure to set isTotalLoading to false
    isTotalLoading = false;
  }
});

const fetchPatients = async (page: number) => {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const params: Record<string, any> = {
        _sort: '-_lastUpdated',
        _count: 15,
        _offset: page * 15,
        _total: 'accurate'
      };

      if (searchLastName) {
        switch(selectedServer) {
          case FHIR_SERVERS.MEDBLOCKS:
            params.family = searchLastName; // Try exact match
            break;
          case FHIR_SERVERS.KODJIN:
            params.family = searchLastName;
            break;
          case FHIR_SERVERS.HAPI:
            params['family:contains'] = searchLastName;
            break;
          default:
            params.family = searchLastName;
        }
      }
      
      if (searchBirthDate) {
        params.birthdate = searchBirthDate;
      }

      const response = await fhirApi.get('/Patient', { params });
      error = null;
      return response.data;
    } catch (err) {
      console.error(`Attempt ${retryCount + 1} failed:`, err);
      retryCount++;
      if (retryCount === maxRetries) {
        error = 'Failed to fetch patients. Please try again.';
        return { entry: [] };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
};

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

// Update the fetchTotalCount function
const fetchTotalCount = async () => {
  try {
    const response = await fhirApi.get('/Patient', {
      params: {
        _count: 15,  // Get a full page to count entries
        _total: 'accurate'
      }
    });
    
    if (selectedServer === FHIR_SERVERS.KODJIN) {
      // For Kodjin, count the entries and check for next page
      const entries = response.data.entry?.length || 0;
      const hasNextPage = response.data.link?.some((link: { relation: string }) => link.relation === 'next');
      totalPatients = hasNextPage ? entries * 2 : entries;  // Conservative estimate
    } else {
      // For other servers, use the total from response
      totalPatients = response.data.total || 0;
    }
  } catch (error) {
    console.error('Error fetching total count:', error);
    totalPatients = 0;
  }
};

// Update handleServerChange to use the new fetchTotalCount
const handleServerChange = async (newServer: string) => {
  try {
    isLoading = true;
    selectedServer = newServer;
    // Save selected server to session storage
    sessionStorage.setItem('selectedServer', newServer);
    setFhirServer(newServer);
    
    // Reset all state
    page = 0;
    patients = null;
    totalPatients = 0;
    
    // Fetch new data
    await fetchTotalCount();
    await initializePatients();
    
  } catch (error) {
    console.error('Error changing server:', error);
    error = 'Failed to change server. Please try again.';
  } finally {
    isLoading = false;
    isTotalLoading = false;  // Reset loading state for total
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

// Add a formatter function
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

</script>

<main>
  <div class="w-full max-w-[1400px] mx-auto px-8 my-10">
    <hr class="border-[#2B57AD]/50 my-2">
    <div class="relative flex justify-center items-center my-1">
      <h1 class="text-2xl text-[#2B57AD] font-semibold">PATIENT ROSTER</h1>
      <span class="absolute right-0 text-sm text-gray-500">{kolkataTime}</span>
    </div>
    <hr class="border-[#2B57AD]/50 my-2">
    <div class="my-4 flex gap-4 items-end justify-between">
      <div class="flex gap-4 items-end">
        <div class="flex gap-4 items-end min-w-[600px]">
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
            class="bg-[#2B57AD] hover:bg-[#2B57AD]/90 text-white p-2 px-4 rounded transition-colors min-w-[120px]"
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
            class="bg-[#B91F3B] hover:bg-[#B91F3B]/90 text-white p-2 px-4 rounded transition-colors min-w-[150px]"
            on:click={() => navigate('/patient/create')}
          >
            CREATE PATIENT
          </button>
        </div>
      </div>

      <div class="flex gap-4 items-center">
        <span class="text-[#2B57AD] font-medium min-w-[200px]">
          {#if isTotalLoading}
            <span class="animate-pulse">Loading...</span>
          {:else}
            Total Patients: {formatNumber(totalPatients)}
          {/if}
        </span>
        
        {#each Object.entries(FHIR_SERVERS) as [key, value]}
          <label class="flex items-center">
            <input
              type="radio"
              name="server"
              value={value}
              checked={selectedServer === value}
              on:change={() => handleServerChange(value)}
              disabled={isServerChanging}
              class="mr-2 accent-[#2B57AD]"
            />
            <span class="text-[#2B57AD] {isServerChanging ? 'opacity-50' : ''}">{key}</span>
          </label>
        {/each}
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
              <td class="p-2 flex items-center gap-2">
                <button 
                  class="text-[#2B57AD] hover:text-[#2B57AD]/80 transition-colors"
                  on:click={() => navigate(`/patient/view/${patient.resource.id}`)}
                  aria-label="View patient details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  class="text-[#2B57AD] hover:text-[#2B57AD]/80 transition-colors"
                  on:click={() => navigate(`/patient/edit/${patient.resource.id}`)}
                  aria-label="Edit patient"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.793 8.793-3.536 1.414 1.414-3.536 8.793-8.793z" />
                  </svg>
                </button>
              </td>
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
