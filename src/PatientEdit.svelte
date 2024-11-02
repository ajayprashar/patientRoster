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

  let errors = {
    givenName: '',
    familyName: '',
    birthDate: '',
    gender: '',
    phone: ''
  };

  let submitError = '';
  let isLoading = true;

  let showDeleteConfirm = false;

  const handleDeleteClick = () => {
    showDeleteConfirm = true;
  };

  const handleDelete = async (confirmed: boolean) => {
    showDeleteConfirm = false;
    if (confirmed) {
      try {
        await fhirApi.delete(`/Patient/${id}`);
        sessionStorage.setItem('patientDeleted', 'true');
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error deleting patient:', error);
        submitError = 'Failed to delete patient. Please try again.';
      }
    }
  };

  onMount(async () => {
    try {
      const response = await fhirApi.get(`/Patient/${id}`);
      const fhirPatient = response.data;
      
      // Convert FHIR patient to form data
      patient = {
        givenName: fhirPatient.name?.[0]?.given?.[0] || '',
        familyName: fhirPatient.name?.[0]?.family || '',
        birthDate: fhirPatient.birthDate || '',
        gender: fhirPatient.gender === 'male' ? 'M' : 
                fhirPatient.gender === 'female' ? 'F' : 'U',
        phone: fhirPatient.telecom?.[0]?.value || ''
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      submitError = 'Failed to load patient data.';
    } finally {
      isLoading = false;
    }
  });

  // Reuse validation functions from PatientCreate
  const validateName = (name: string, field: 'givenName' | 'familyName') => {
    if (!name) {
      errors[field] = 'Name is required';
      return false;
    }
    if (!/^[A-Z][a-zA-z]*$/.test(name)) {
      errors[field] = 'Name must start with capital letter';
      return false;
    }
    errors[field] = '';
    return true;
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true;
    const stripped = phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(stripped)) {
      errors.phone = 'Phone must be 10 digits';
      return false;
    }
    errors.phone = '';
    return true;
  };

  const formatPhone = (phone: string) => {
    const stripped = phone.replace(/\D/g, '');
    if (stripped.length >= 6) {
      return `${stripped.slice(0,3)}-${stripped.slice(3,6)}-${stripped.slice(6)}`;
    } else if (stripped.length >= 3) {
      return `${stripped.slice(0,3)}-${stripped.slice(3)}`;
    }
    return stripped;
  };

  const handleInput = (event: Event, field: keyof typeof patient) => {
    const input = event.target as HTMLInputElement;
    if (field === 'phone') {
      patient[field] = formatPhone(input.value);
    } else {
      patient[field] = input.value;
    }
  };

  $: isFormValid = patient.givenName && 
                   patient.familyName && 
                   patient.birthDate && 
                   patient.gender &&
                   !errors.givenName &&
                   !errors.familyName &&
                   (!patient.phone || !errors.phone);

  const handleSubmit = async () => {
    const isGivenNameValid = validateName(patient.givenName, 'givenName');
    const isFamilyNameValid = validateName(patient.familyName, 'familyName');
    
    if (!patient.birthDate) {
      errors.birthDate = 'Birth date is required';
      return;
    }
    if (!patient.gender) {
      errors.gender = 'Gender is required';
      return;
    }

    if (!isGivenNameValid || !isFamilyNameValid) {
      return;
    }

    try {
      const fhirPatient = {
        resourceType: 'Patient',
        id: id,
        name: [{
          given: [patient.givenName],
          family: patient.familyName
        }],
        birthDate: patient.birthDate,
        gender: patient.gender === 'U' ? 'unknown' : 
                patient.gender === 'M' ? 'male' : 'female',
        telecom: patient.phone ? [{
          system: 'phone',
          value: patient.phone.replace(/\D/g, ''),
          use: 'home'
        }] : []
      };

      await fhirApi.put(`/Patient/${id}`, fhirPatient);
      navigate('/');
    } catch (error) {
      console.error('Error updating patient:', error);
      submitError = 'Failed to update patient. Please try again.';
    }
  };
</script>

<main class="w-full max-w-2xl mx-auto my-10">
  <div class="bg-white p-6 rounded-lg shadow-md border border-[#2B57AD]/10">
    <hr class="border-[#2B57AD]/50 my-2">
    <div class="flex justify-center items-center my-1">
      <h1 class="text-2xl text-[#2B57AD] font-semibold">EDIT PATIENT</h1>
    </div>
    <hr class="border-[#2B57AD]/50 my-2">
    
    {#if isLoading}
      <p class="text-[#2B57AD] animate-pulse text-center">Loading patient data...</p>
    {:else}
      <form class="space-y-4 mt-6" on:submit|preventDefault={handleSubmit}>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm text-[#2B57AD] font-medium mb-1" for="givenName">
              Given Name <span class="text-[#B91F3B]">*</span>
            </label>
            <input
              type="text"
              id="givenName"
              name="givenName"
              class="mt-1 block w-full border-2 border-[#2B57AD]/20 p-2 rounded focus:border-[#2B57AD]/50 focus:outline-none"
              placeholder="Given Name"
              bind:value={patient.givenName}
              on:input={(e) => handleInput(e, 'givenName')}
              on:blur={() => validateName(patient.givenName, 'givenName')}
            />
            {#if errors.givenName}
              <p class="text-[#B91F3B] text-sm mt-1">{errors.givenName}</p>
            {/if}
          </div>

          <div class="flex-1">
            <label class="block text-sm text-[#2B57AD] font-medium mb-1" for="familyName">
              Family Name <span class="text-[#B91F3B]">*</span>
            </label>
            <input
              type="text"
              id="familyName"
              name="familyName"
              class="mt-1 block w-full border-2 border-[#2B57AD]/20 p-2 rounded focus:border-[#2B57AD]/50 focus:outline-none"
              placeholder="Family Name"
              bind:value={patient.familyName}
              on:input={(e) => handleInput(e, 'familyName')}
              on:blur={() => validateName(patient.familyName, 'familyName')}
            />
            {#if errors.familyName}
              <p class="text-[#B91F3B] text-sm mt-1">{errors.familyName}</p>
            {/if}
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm text-[#2B57AD] font-medium mb-1" for="birthDate">
              Birth Date <span class="text-[#B91F3B]">*</span>
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              class="mt-1 block w-full border-2 border-[#2B57AD]/20 p-2 rounded focus:border-[#2B57AD]/50 focus:outline-none"
              bind:value={patient.birthDate}
            />
            {#if errors.birthDate}
              <p class="text-[#B91F3B] text-sm mt-1">{errors.birthDate}</p>
            {/if}
          </div>

          <div class="flex-1">
            <fieldset>
              <legend class="block text-sm text-[#2B57AD] font-medium mb-1">
                Gender <span class="text-[#B91F3B]">*</span>
              </legend>
              <div class="flex gap-4 mt-1">
                <label class="inline-flex items-center text-[#2B57AD]" for="editGenderMale">
                  <input
                    type="radio"
                    id="editGenderMale"
                    name="editGender"
                    value="M"
                    bind:group={patient.gender}
                    class="mr-2 accent-[#2B57AD]"
                  />
                  Male
                </label>
                <label class="inline-flex items-center text-[#2B57AD]" for="editGenderFemale">
                  <input
                    type="radio"
                    id="editGenderFemale"
                    name="editGender"
                    value="F"
                    bind:group={patient.gender}
                    class="mr-2 accent-[#2B57AD]"
                  />
                  Female
                </label>
                <label class="inline-flex items-center text-[#2B57AD]" for="editGenderUnknown">
                  <input
                    type="radio"
                    id="editGenderUnknown"
                    name="editGender"
                    value="U"
                    bind:group={patient.gender}
                    class="mr-2 accent-[#2B57AD]"
                  />
                  Unknown
                </label>
              </div>
            </fieldset>
            {#if errors.gender}
              <p class="text-[#B91F3B] text-sm mt-1">{errors.gender}</p>
            {/if}
          </div>
        </div>

        <div class="flex-1">
          <label class="block text-sm text-[#2B57AD] font-medium mb-1" for="phone">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            class="mt-1 block w-full border-2 border-[#2B57AD]/20 p-2 rounded focus:border-[#2B57AD]/50 focus:outline-none"
            placeholder="123-456-7890"
            bind:value={patient.phone}
            on:input={(e) => handleInput(e, 'phone')}
            on:blur={() => validatePhone(patient.phone)}
          />
          {#if errors.phone}
            <p class="text-[#B91F3B] text-sm mt-1">{errors.phone}</p>
          {/if}
        </div>

        {#if submitError}
          <div class="text-[#B91F3B] mt-4">{submitError}</div>
        {/if}

        <div class="flex justify-between gap-4 mt-6">
          <button
            type="button"
            class="px-4 py-2 bg-[#B91F3B] hover:bg-[#B91F3B]/90 text-white rounded transition-colors"
            on:click={handleDeleteClick}
          >
            DELETE
          </button>
          
          <div class="flex gap-4">
            <button
              type="button"
              class="px-4 py-2 bg-[#F57B17] hover:bg-[#F57B17]/90 text-white rounded transition-colors"
              on:click={() => navigate('/')}
            >
              CANCEL
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-[#2B57AD] hover:bg-[#2B57AD]/90 text-white rounded transition-colors"
              disabled={!isFormValid}
              class:opacity-50={!isFormValid}
            >
              SAVE
            </button>
          </div>
        </div>
      </form>
    {/if}
  </div>
</main>

<!-- Add the modal dialog -->
{#if showDeleteConfirm}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
      <h2 class="text-xl text-[#2B57AD] font-semibold mb-4">PATIENT ROSTER says</h2>
      <p class="text-gray-700 mb-6">Are you sure you want to delete this patient? This action cannot be undone.</p>
      <div class="flex justify-end gap-4">
        <button
          class="px-4 py-2 bg-[#F57B17] hover:bg-[#F57B17]/90 text-white rounded transition-colors"
          on:click={() => handleDelete(false)}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-[#B91F3B] hover:bg-[#B91F3B]/90 text-white rounded transition-colors"
          on:click={() => handleDelete(true)}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if} 