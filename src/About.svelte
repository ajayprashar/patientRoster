<script lang="ts">
  import mermaid from 'mermaid';
  import { onMount } from 'svelte';
  import { navigate } from "svelte-routing";
  
  onMount(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'neutral',
      flowchart: {
        curve: 'basis'
      }
    });
  });
</script>

<main class="w-full max-w-7xl mx-auto px-8 my-10">
  <div class="bg-white p-6 rounded-lg shadow-md border border-[#2B57AD]/10">
    <hr class="border-[#2B57AD]/50 my-2">
    <div class="flex justify-center items-center my-1">
      <h1 class="text-2xl text-[#2B57AD] font-semibold">ABOUT PATIENT ROSTER</h1>
    </div>
    <hr class="border-[#2B57AD]/50 my-2">

    <div class="prose max-w-none">
      <h2 class="text-xl text-[#2B57AD] mt-6 mb-4">Application Architecture</h2>
      
      <pre class="mermaid">
        graph TD
            subgraph Frontend_App["Patient Roster Application"]
                A[App.svelte] --> B[PatientList.svelte]
                A --> C[PatientCreate.svelte]
                A --> D[PatientEdit.svelte]
                A --> E[PatientView.svelte]
                
                subgraph Routing["Routing Layer"]
                    F[svelte-routing] --> A
                end
                
                subgraph API_Layer["API Integration"]
                    G[api.ts] --> H[FHIR Servers]
                    H --> H1[MEDBLOCKS]
                    H --> H2[HAPI]
                    H --> H3[KODJIN]
                end
                
                subgraph Styling["Styling System"]
                    I[app.css] --> J[Tailwind CSS]
                end
            end

            B --> G
            C --> G
            D --> G
            E --> G

            classDef component fill:#e1f5fe,stroke:#01579b
            classDef config fill:#fff3e0,stroke:#ff6f00
            classDef api fill:#e8f5e9,stroke:#2e7d32
            
            class A,B,C,D,E component
            class G,H,H1,H2,H3 api
      </pre>

      <h2 class="text-xl text-[#2B57AD] mt-8 mb-4">Key Components</h2>
      
      <h3 class="text-lg text-[#2B57AD] mt-4">Core Components</h3>
      <ul class="list-disc ml-6 mt-2">
        <li><strong>App.svelte:</strong> Main container and router setup</li>
        <li><strong>PatientList.svelte:</strong> Main dashboard view with search</li>
        <li><strong>PatientCreate.svelte:</strong> Patient creation form</li>
        <li><strong>PatientEdit.svelte:</strong> Patient editing interface</li>
        <li><strong>PatientView.svelte:</strong> Patient details view</li>
      </ul>

      <h3 class="text-lg text-[#2B57AD] mt-4">API Integration</h3>
      <ul class="list-disc ml-6 mt-2">
        <li><strong>api.ts:</strong> Central FHIR API configuration</li>
        <li>Supports multiple FHIR servers (MEDBLOCKS, HAPI, KODJIN)</li>
      </ul>

      <h3 class="text-lg text-[#2B57AD] mt-4">Technology Stack</h3>
      <div class="space-y-4 ml-6 mt-2">
        <div>
          <h4 class="font-semibold">Svelte & TypeScript</h4>
          <p class="text-gray-700 mt-1">
            This patient roster application uses Svelte's reactive components to automatically update the UI when patient data changes. 
            TypeScript ensures the FHIR patient data is properly structured, helping prevent errors when handling medical records.
          </p>
          <ul class="list-disc ml-6 mt-2 text-gray-700">
            <li>Real-time search filtering in PatientList without page reloads</li>
            <li>Form validation with immediate feedback in PatientCreate and PatientEdit</li>
            <li>Automatic UI updates when switching between FHIR servers</li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold">Tailwind CSS</h4>
          <p class="text-gray-700 mt-1">
            The interface implements a healthcare-focused color scheme and consistent styling across all patient management screens:
          </p>
          <ul class="list-disc ml-6 mt-2 text-gray-700">
            <li>Medical-themed blue (#2B57AD) for headers and primary actions</li>
            <li>Warning orange (#F57B17) for cancel actions and alerts</li>
            <li>Responsive patient list that adapts to different screen sizes</li>
            <li>Consistent padding and spacing in all patient forms</li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold">FHIR API Integration</h4>
          <p class="text-gray-700 mt-1">
            The application connects to multiple FHIR servers, enabling users to:
          </p>
          <ul class="list-disc ml-6 mt-2 text-gray-700">
            <li>Search patients by name and birth date across different FHIR servers</li>
            <li>Create and update patient records with standardized FHIR formatting</li>
            <li>Switch between MEDBLOCKS, HAPI, and KODJIN servers without data loss</li>
            <li>View total patient counts across different FHIR implementations</li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold">Vite Build System</h4>
          <p class="text-gray-700 mt-1">
            The development workflow leverages Vite for:
          </p>
          <ul class="list-disc ml-6 mt-2 text-gray-700">
            <li>Instant preview of patient form changes during development</li>
            <li>Fast compilation of Svelte components and TypeScript code</li>
            <li>Optimized production build for quick patient data loading</li>
            <li>Environment variable management for FHIR server configurations</li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold">Additional Tools</h4>
          <p class="text-gray-700 mt-1">
            Essential tools that power specific features in this application:
          </p>
          <ul class="list-disc ml-6 mt-2 text-gray-700">
            <li><strong>Svelte Routing:</strong> Powers navigation between patient views and forms</li>
            <li><strong>Axios:</strong> Handles all FHIR server communications with error handling</li>
            <li><strong>Mermaid:</strong> Creates this interactive architecture documentation</li>
            <li><strong>ESLint:</strong> Maintains consistent code style across all patient management features</li>
          </ul>
        </div>
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
</main>

<style>
  :global(.prose) {
    max-width: none;
  }
  :global(.mermaid) {
    background-color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }
</style>
