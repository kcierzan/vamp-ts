<script lang="ts">
  import Project from "./Project.svelte";

  export let data;
</script>

<Project projectData={data.project} supabase={data.supabase} />

<form method="post" action="?/delete">
  <input type="hidden" id="projectId" name="projectId" value={data.project.id} />
  <button class="btn btn-primary">Delete</button>
</form>
