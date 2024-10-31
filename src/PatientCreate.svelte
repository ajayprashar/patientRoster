<script lang="ts">
  import { fhirApi } from "./api";
  import { navigate } from "svelte-routing";
  
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

  // Validation functions
  const validateName = (name: string, field: 'givenName' | 'familyName') => {
    if (!name) {
      errors[field] = 'Name is required';
      return false;
    }
    if (!/^[A-Z][a-z]*$/.test(name)) {
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

  // Add a computed property for form validity
  $: isFormValid = patient.givenName && 
                   patient.familyName && 
                   patient.birthDate && 
                   patient.gender &&
                   !errors.givenName &&
                   !errors.familyName &&
                   (!patient.phone || !errors.phone);

  // Update handleSubmit to check all required fields
  const handleSubmit = async () => {
    // Validate all required fields
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
        name: [{
          given: [patient.givenName],
          family: patient.familyName
        }],
        birthDate: patient.birthDate,
        gender: patient.gender === 'U' ? 'unknown' : 
                patient.gender === 'M' ? 'male' : 'female',
        telecom: [{
          system: 'phone',
          value: patient.phone.replace(/\D/g, ''),
          use: 'home'
        }]
      };

      await fhirApi.post('/Patient', fhirPatient);
      navigate('/');
    } catch (error) {
      console.error('Error creating patient:', error);
      submitError = 'Failed to create patient. Please try again.';
    }
  };
</script>

<main class="w-full max-w-2xl mx-auto my-10">
  <div class="bg-white p-6 rounded-lg shadow">
    <h1 class="text-2xl font-semibold mb-6">Create Patient</h1>
    
    <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1" for="givenName">
            Given Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="givenName"
            name="givenName"
            class="mt-1 block w-full"
            placeholder="Given Name"
            bind:value={patient.givenName}
            on:input={(e) => handleInput(e, 'givenName')}
            on:blur={() => validateName(patient.givenName, 'givenName')}
          />
          {#if errors.givenName}
            <p class="text-red-500 text-sm mt-1">{errors.givenName}</p>
          {/if}
        </div>

        <div class="flex-1">
          <label class="block text-sm font-medium mb-1" for="familyName">
            Family Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="familyName"
            name="familyName"
            class="mt-1 block w-full"
            placeholder="Family Name"
            bind:value={patient.familyName}
            on:input={(e) => handleInput(e, 'familyName')}
            on:blur={() => validateName(patient.familyName, 'familyName')}
          />
          {#if errors.familyName}
            <p class="text-red-500 text-sm mt-1">{errors.familyName}</p>
          {/if}
        </div>
      </div>

      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1" for="birthDate">
            Birth Date <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            class="mt-1 block w-full"
            bind:value={patient.birthDate}
          />
          {#if errors.birthDate}
            <p class="text-red-500 text-sm mt-1">{errors.birthDate}</p>
          {/if}
        </div>

        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Gender <span class="text-red-500">*</span></label>
          <div class="flex gap-4 mt-1">
            <label class="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="M"
                bind:group={patient.gender}
                class="mr-2"
              />
              Male
            </label>
            <label class="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="F"
                bind:group={patient.gender}
                class="mr-2"
              />
              Female
            </label>
            <label class="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="U"
                bind:group={patient.gender}
                class="mr-2"
              />
              Unknown
            </label>
          </div>
          {#if errors.gender}
            <p class="text-red-500 text-sm mt-1">{errors.gender}</p>
          {/if}
        </div>
      </div>

      <div class="flex-1">
        <label class="block text-sm font-medium mb-1" for="phone">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          class="mt-1 block w-full"
          placeholder="123-456-7890"
          bind:value={patient.phone}
          on:input={(e) => handleInput(e, 'phone')}
          on:blur={() => validatePhone(patient.phone)}
        />
        {#if errors.phone}
          <p class="text-red-500 text-sm mt-1">{errors.phone}</p>
        {/if}
      </div>

      {#if submitError}
        <div class="text-red-500 mt-4">{submitError}</div>
      {/if}

      <div class="flex justify-end gap-4 mt-6">
        <button
          type="button"
          class="px-4 py-2 bg-gray-300 text-black rounded"
          on:click={() => navigate('/')}
        >
          CANCEL
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-black text-white rounded"
          disabled={!isFormValid}
          class:opacity-50={!isFormValid}
        >
          SAVE
        </button>
      </div>
    </form>
  </div>
</main> 