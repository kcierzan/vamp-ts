<script lang="ts">
  import SceneButton from "./SceneButton.svelte";
  import { getProjectContext } from "$lib/utils";

  const project = getProjectContext();

  const NUMBER_OF_ROWS = 16;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS
  }));
</script>

{#if project && Object.keys(project.scenes.sceneMap).length > 0}
  <div class="flex flex-col items-start gap-1 rounded border-2 border-slate-200 px-1 pt-2">
    <div class="flex h-6 w-full flex-row justify-center">
      <div>Scenes</div>
    </div>
    {#each slots as slot, index (slot.id)}
      {#if index in project.scenes.sceneMap}
        <div class="box-content rounded border-2 border-white">
          <SceneButton
            {index}
            clips={project.scenes.getSceneClips(index)}
            state={project.scenes.getSceneState(index)}
          />
        </div>
      {:else}
        <div class="box-content rounded border-2 border-white">
          <div class="placeholder h-8 w-20 rounded" />
        </div>
      {/if}
    {/each}
  </div>
{/if}
