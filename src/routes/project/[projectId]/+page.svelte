<script lang="ts">
  export let data;
</script>

<div class="prose">
  <h1>{data.project.name}</h1>
  <p>{data.project.description}</p>
</div>

<form method="post" action="?/delete">
  <input type="hidden" id="projectId" name="projectId" value={data.project.id} />
  <button class="btn btn-primary">Delete</button>
</form>
