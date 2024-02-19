<script lang="ts">
  export let data;
</script>

<h1>Vamp</h1>

<h2>My projects</h2>
<ul>
  {#if data.projects}
    {#each data.projects as project (project.id)}
      <li>{project.name}</li>
    {/each}
  {/if}
</ul>

<a href="/account">Edit account</a>
