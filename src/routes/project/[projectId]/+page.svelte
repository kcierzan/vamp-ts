<script lang="ts">
  import LiveSet from "$lib/components/LiveSet.svelte";

  export let data;
</script>

<LiveSet project={data.project} />

<form method="post" action="?/delete">
  <input type="hidden" id="projectId" name="projectId" value={data.project.id} />
  <button class="btn btn-primary">Delete</button>
</form>
