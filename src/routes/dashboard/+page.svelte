<script lang="ts">
  import ProjectCard from "$lib/ProjectCard.svelte";

  export let data;
</script>

<h1 class="text-4xl font-bold">Vamp</h1>
<h2 class="text-2xl font-semibold">My projects</h2>

<div class="">
  <ul class="flex flex-row space-x-4">
    {#if data.projects}
      {#each data.projects as project (project.id)}
        <div class="w-80">
          <ProjectCard
            title={project.name}
            description={project.description}
            cta={"Open"}
            href={`/project/${project.id}`}
          />
        </div>
      {/each}
    {/if}
  </ul>
</div>

<a class="link" href="/account">Edit account</a>
