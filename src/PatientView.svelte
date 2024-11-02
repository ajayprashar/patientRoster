<script lang="ts">
  import { fhirApi } from "./api";
  import { navigate } from "svelte-routing";
  import { onMount } from 'svelte';
  
  export let id: string;

  let patient = {
    givenName: '',
    familyName: '',
    birthDate: '',
    gender: '',
    phone: ''
  };

  let isLoading = true;
  let error: string | null = null;

  const calculateAge = (birthDate: string | undefined): string => {
    if (!birthDate) return 'Unknown';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Check for future dates
    if (birth > today) return 'Unknown';
    
    // Calculate the time difference in milliseconds
    let age = today.getFullYear() - birth.getFullYear();
    
    // Adjust age if birthday hasn't occurred this year
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // If age is 0, calculate days
    if (age === 0) {
      const diffTime = Math.abs(today.getTime() - birth.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    }
    
    return age > 0 ? age.toString() : 'Unknown';
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Not provided';
    
    // Create a date object and format it as YYYY-MM-DD
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  onMount(async () => {
    try {
      const response = await fhirApi.get(`/Patient/${id}`);
      const fhirPatient = response.data;
      
      patient = {
        givenName: fhirPatient.name?.[0]?.given?.[0] || '',
        familyName: fhirPatient.name?.[0]?.family || '',
        birthDate: fhirPatient.birthDate || '',
        gender: fhirPatient.gender === 'male' ? 'M' : 
                fhirPatient.gender === 'female' ? 'F' : 'U',
        phone: fhirPatient.telecom?.[0]?.value || ''
      };
    } catch (err) {
      console.error('Error fetching patient:', err);
      error = 'Failed to load patient data';
    } finally {
      isLoading = false;
    }
  });
</script>

<main class="w-full max-w-2xl mx-auto my-10">
  <div class="bg-white p-6 rounded-lg shadow-md border border-[#2B57AD]/10">
    <hr class="border-[#2B57AD]/50 my-2">
    <div class="flex justify-center items-center my-1">
      <h1 class="text-2xl text-[#2B57AD] font-semibold">VIEW PATIENT</h1>
    </div>
    <hr class="border-[#2B57AD]/50 my-2">
    
    {#if isLoading}
      <p class="text-[#2B57AD] animate-pulse text-center">Loading patient data...</p>
    {:else if error}
      <p class="text-[#B91F3B] text-center">{error}</p>
    {:else}
      <div class="space-y-4 mt-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <label 
              class="block text-sm text-[#2B57AD] font-medium mb-1"
              id="viewGivenNameLabel"
              for="viewGivenName"
            >Given Name</label>
            <div 
              id="viewGivenName"
              class="mt-1 p-2 border-2 border-[#2B57AD]/20 rounded"
              role="textbox"
              aria-readonly="true"
            >
              {patient.givenName || 'Not provided'}
            </div>
          </div>

          <div class="flex-1">
            <label 
              class="block text-sm text-[#2B57AD] font-medium mb-1"
              id="viewFamilyNameLabel"
              for="viewFamilyName"
            >Family Name</label>
            <div 
              id="viewFamilyName"
              class="mt-1 p-2 border-2 border-[#2B57AD]/20 rounded"
              role="textbox"
              aria-readonly="true"
            >
              {patient.familyName || 'Not provided'}
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-1">
            <label 
              class="block text-sm text-[#2B57AD] font-medium mb-1"
              id="viewBirthDateLabel"
              for="viewBirthDate"
            >Birth Date</label>
            <div 
              id="viewBirthDate"
              class="mt-1 p-2 border-2 border-[#2B57AD]/20 rounded"
              role="textbox"
              aria-readonly="true"
            >
              {formatDate(patient.birthDate)}
            </div>
          </div>

          <div class="flex-1">
            <label 
              class="block text-sm text-[#2B57AD] font-medium mb-1"
              id="viewAgeLabel"
              for="viewAge"
            >Age</label>
            <div 
              id="viewAge"
              class="mt-1 p-2 border-2 border-[#2B57AD]/20 rounded"
              role="textbox"
              aria-readonly="true"
            >
              {calculateAge(patient.birthDate)}
            </div>
          </div>

          <div class="flex-1">
            <label 
              class="block text-sm text-[#2B57AD] font-medium mb-1"
              id="viewGenderLabel"
              for="viewGender"
            >Gender</label>
            <div 
              id="viewGender"
              class="mt-1 p-2 border-2 border-[#2B57AD]/20 rounded"
              role="textbox"
              aria-readonly="true"
            >
              {patient.gender === 'M' ? 'Male' : 
               patient.gender === 'F' ? 'Female' : 'Unknown'}
            </div>
          </div>
        </div>

        <div class="flex-1">
          <label 
            class="block text-sm text-[#2B57AD] font-medium mb-1"
            id="viewPhoneNumberLabel"
            for="viewPhoneNumber"
          >Phone Number</label>
          <div 
            id="viewPhoneNumber"
            class="mt-1 p-2 border-2 border-[#2B57AD]/20 rounded"
            role="textbox"
            aria-labelledby="viewPhoneNumberLabel"
            aria-readonly="true"
          >
            {patient.phone || 'Not provided'}
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            type="button"
            class="px-4 py-2 bg-[#F57B17] hover:bg-[#F57B17]/90 text-white rounded transition-colors"
            on:click={() => navigate('/')}
          >
            CANCEL
          </button>
        </div>
      </div>
    {/if}
  </div>
</main> 