<script lang="ts">
  import PatientList from "./patientList.svelte";
  import PatientCreate from "./PatientCreate.svelte";
  import PatientEdit from "./PatientEdit.svelte";
  import PatientView from "./PatientView.svelte";
  import About from "./About.svelte";
  import { Router, Link, Route } from "svelte-routing";
  import { onMount } from 'svelte';

  let kolkataTime = '';

  const updateKolkataTime = () => {
    const time = new Date().toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
    kolkataTime = `Kolkata Time: ${time}`;
  };

  onMount(() => {
    updateKolkataTime();
    const timer = setInterval(updateKolkataTime, 60000);
    return () => clearInterval(timer);
  });
</script>

<Router>
  <main>
    <div class="w-full">
      <Route path="/">
        <PatientList {kolkataTime}/>
      </Route>
      <Route path="/about">
        <About/>
      </Route>
      <Route path="/patient/create">
        <PatientCreate/>
      </Route>
      <Route path="/patient/edit/:id" let:params>
        <PatientEdit id={params.id}/>
      </Route>
      <Route path="/patient/view/:id" let:params>
        <PatientView id={params.id}/>
      </Route>
    </div>
  </main>
</Router>