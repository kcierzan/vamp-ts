<script lang="ts">
  import { enhance } from "$app/forms";
  import ProjectCard from "$lib/ProjectCard.svelte";

  export let data;

  function handleCreateProject() {
    return async ({ update }: { update: () => void }) => {
      update();
    };
  }
</script>

<h1 class="text-4xl font-bold">Vamp</h1>
<h2 class="text-2xl font-semibold">My projects</h2>

<h3>Create a new project</h3>
<form action="?/create_project" method="post" use:enhance={handleCreateProject}>
  <div>
    <button class="btn btn-primary grow">New project</button>
  </div>
</form>

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

<a class="link" href="/account">Edit account</a>
