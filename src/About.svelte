<script lang="ts">
  import { navigate } from "svelte-routing";
  import mermaid from 'mermaid';
  import { onMount, onDestroy } from 'svelte';
  import { marked } from 'marked';
  import readmeContent from '../README.md?raw';
  
  // Parse markdown to HTML
  const parsedReadme = marked(readmeContent);
  
  let showDiagramModal = false;
  
  const toggleDiagram = () => {
    showDiagramModal = !showDiagramModal;
    if (showDiagramModal) {
      // Reinitialize mermaid for the modal diagram
      setTimeout(() => {
        mermaid.init();
      }, 100);
    }
    // Add keyboard event listener when modal is open
    if (showDiagramModal) {
      window.addEventListener('keydown', handleKeydown);
    } else {
      window.removeEventListener('keydown', handleKeydown);
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      toggleDiagram();
    }
  };

  // Clean up event listener on component destruction
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

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
    <!-- Top section -->
    <hr class="border-[#2B57AD]/50 my-2">
    <div class="flex justify-between items-center my-1">
      <h1 class="text-2xl text-[#2B57AD] font-semibold">ABOUT PATIENT ROSTER</h1>
      <button
        type="button"
        class="px-4 py-2 bg-[#F57B17] hover:bg-[#F57B17]/90 text-white rounded transition-colors"
        on:click={() => navigate('/')}
      >
        CANCEL
      </button>
    </div>
    <hr class="border-[#2B57AD]/50 my-2">

    <!-- Architecture section -->
    <div class="prose max-w-none">
      <h2 class="text-xl text-[#2B57AD] mt-6 mb-4">Application Architecture</h2>
      
      <div class="relative">
        <button
          class="absolute top-2 right-2 text-[#2B57AD] hover:text-[#2B57AD]/80 transition-colors"
          on:click={toggleDiagram}
          aria-label="View diagram in full screen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        
        <pre class="mermaid">
          graph TD
              subgraph Frontend_App["Patient Roster Application"]
                  A[App.svelte] --> B[PatientList.svelte]
                  A --> C[PatientCreate.svelte]
                  A --> D[PatientEdit.svelte]
                  A --> E[PatientView.svelte]
                  A --> AB[About.svelte]
                  
                  subgraph About_Content["About Page Content"]
                      AB --> M[Mermaid Diagram]
                      AB --> R[README.md Content]
                      M --> M1[Application Architecture]
                      R --> R1[Technical Documentation]
                      R --> R2[Features]
                      R --> R3[API Integration]
                  end
                  
                  subgraph Routing["Routing Layer"]
                      F[svelte-routing] --> A
                  end
                  
                  subgraph API_Layer["API Integration"]
                      G[api.ts] --> H[FHIR Servers]
                      H --> H1[MEDBLOCKS]
                      H --> H2[HAPI]
                      H --> H3[KODJIN]
                  end
                  
                  subgraph Data_Updates["Data Refresh Points"]
                      direction TB
                      R4["🔄 Total Patients<br/>Server Switch"]
                      R5["🔄 Patient List<br/>Search/Reset"]
                      R6["🔄 After Create/Edit<br/>Redirect to List"]
                  end
              end

              B --> G
              C --> G
              D --> G
              E --> G

              R4 -.-> B
              R5 -.-> B
              R6 -.-> B

              classDef component fill:#e1f5fe,stroke:#01579b
              classDef config fill:#fff3e0,stroke:#ff6f00
              classDef api fill:#e8f5e9,stroke:#2e7d32
              classDef refresh fill:#f3e5f5,stroke:#7b1fa2,width:200px
              classDef about fill:#f3e5f5,stroke:#7b1fa2
              classDef content fill:#e8eaf6,stroke:#3f51b5
              
              class A,B,C,D,E component
              class G,H,H1,H2,H3 api
              class R4,R5,R6 refresh
              class AB about
              class M,R,M1,R1,R2,R3 content
        </pre>
      </div>

      <!-- Full-screen modal -->
      {#if showDiagramModal}
        <dialog 
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 w-full h-full" 
          aria-labelledby="modal-title"
          open
        >
          <article 
            class="bg-white rounded-lg shadow-lg p-6 w-[95vw] h-[90vh] overflow-auto"
          >
            <header class="flex justify-between items-center mb-4">
              <h2 id="modal-title" class="text-xl text-[#2B57AD] font-semibold">Application Architecture</h2>
              <button
                type="button"
                class="text-[#2B57AD] hover:text-[#2B57AD]/80 transition-colors"
                on:click={toggleDiagram}
                aria-label="Close full screen view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            
            <pre class="mermaid">
              graph TD
                  subgraph Frontend_App["Patient Roster Application"]
                      A[App.svelte] --> B[PatientList.svelte]
                      A --> C[PatientCreate.svelte]
                      A --> D[PatientEdit.svelte]
                      A --> E[PatientView.svelte]
                      A --> AB[About.svelte]
                      
                      subgraph About_Content["About Page Content"]
                          AB --> M[Mermaid Diagram]
                          AB --> R[README.md Content]
                          M --> M1[Application Architecture]
                          R --> R1[Technical Documentation]
                          R --> R2[Features]
                          R --> R3[API Integration]
                      end
                      
                      subgraph Routing["Routing Layer"]
                          F[svelte-routing] --> A
                      end
                      
                      subgraph API_Layer["API Integration"]
                          G[api.ts] --> H[FHIR Servers]
                          H --> H1[MEDBLOCKS]
                          H --> H2[HAPI]
                          H --> H3[KODJIN]
                      end
                      
                      subgraph Data_Updates["Data Refresh Points"]
                          direction TB
                          R4["🔄 Total Patients<br/>Server Switch"]
                          R5["🔄 Patient List<br/>Search/Reset"]
                          R6["🔄 After Create/Edit<br/>Redirect to List"]
                      end
                  end

                  B --> G
                  C --> G
                  D --> G
                  E --> G

                  R4 -.-> B
                  R5 -.-> B
                  R6 -.-> B

                  classDef component fill:#e1f5fe,stroke:#01579b
                  classDef config fill:#fff3e0,stroke:#ff6f00
                  classDef api fill:#e8f5e9,stroke:#2e7d32
                  classDef refresh fill:#f3e5f5,stroke:#7b1fa2,width:200px
                  classDef about fill:#f3e5f5,stroke:#7b1fa2
                  classDef content fill:#e8eaf6,stroke:#3f51b5
                  
                  class A,B,C,D,E component
                  class G,H,H1,H2,H3 api
                  class R4,R5,R6 refresh
                  class AB about
                  class M,R,M1,R1,R2,R3 content
            </pre>
          </article>
        </dialog>
      {/if}

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

    <!-- Middle section -->
    <hr class="border-[#2B57AD]/50 my-8">
    <div class="flex justify-between items-center">
      <h2 class="text-xl text-[#2B57AD] mb-4">README.md Documentation</h2>
      <button
        type="button"
        class="px-4 py-2 bg-[#F57B17] hover:bg-[#F57B17]/90 text-white rounded transition-colors"
        on:click={() => navigate('/')}
      >
        CANCEL
      </button>
    </div>

    <!-- README section -->
    <div class="markdown-content">
      {@html parsedReadme}
    </div>

    <!-- Bottom section (existing) -->
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

  /* Enhanced markdown content styling */
  :global(.markdown-content) {
    line-height: 1.6;
    color: #374151;
  }

  :global(.markdown-content h1) {
    font-size: 1.875rem;
    color: #2B57AD;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  :global(.markdown-content h2) {
    font-size: 1.5rem;
    color: #2B57AD;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  :global(.markdown-content h3) {
    font-size: 1.25rem;
    color: #2B57AD;
    font-weight: 600;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  :global(.markdown-content ul, .markdown-content ol) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin: 1rem 0;
  }

  :global(.markdown-content ol) {
    list-style-type: decimal;
  }

  :global(.markdown-content li) {
    margin: 0.5rem 0;
  }

  :global(.markdown-content li > ul, .markdown-content li > ol) {
    margin: 0.5rem 0;
  }

  :global(.markdown-content code) {
    background-color: #f3f4f6;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.875rem;
  }

  :global(.markdown-content pre) {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
  }

  :global(.markdown-content pre code) {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 0.875rem;
  }

  :global(.markdown-content p) {
    margin: 1rem 0;
  }

  :global(.markdown-content strong) {
    font-weight: 600;
    color: #2B57AD;
  }

  :global(.markdown-content a) {
    color: #2B57AD;
    text-decoration: underline;
    transition: color 0.2s;
  }

  :global(.markdown-content a:hover) {
    color: #1e3a8a;
  }

  :global(.markdown-content blockquote) {
    border-left: 4px solid #2B57AD;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #4b5563;
  }

  :global(.markdown-content hr) {
    border-color: #2B57AD;
    opacity: 0.2;
    margin: 2rem 0;
  }

  /* Add styles for the modal */
  :global(.modal-mermaid svg) {
    max-width: 100%;
    height: auto;
  }

  dialog {
    border: none;
    background: rgba(0, 0, 0, 0.5);
    max-width: 100vw;
    max-height: 100vh;
    margin: 0;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
</style>
