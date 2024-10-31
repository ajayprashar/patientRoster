<script lang="ts">
  import PatientList from "./patientList.svelte";
  import PatientCreate from "./PatientCreate.svelte";
  import PatientEdit from "./PatientEdit.svelte";
  import { Router, Link, Route } from "svelte-routing";
</script>

<Router>
  <main>
    <div class="w-full my-10">
      <Route path="/">
        <PatientList/>
      </Route>
      <Route path="/patient/create">
        <PatientCreate/>
      </Route>
      <Route path="/patient/edit/:id" let:params>
        <PatientEdit id={params.id}/>
      </Route>
    </div>
  </main>
</Router>