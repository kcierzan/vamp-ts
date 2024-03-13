<script lang="ts">
  import { type ProjectContext } from "$lib/types";
  import SceneButton from "./SceneButton.svelte";
  import { getContext } from "svelte";

  const { project } = getContext<ProjectContext>("project");

  const NUMBER_OF_ROWS = 16;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS
  }));
</script>

{#if project.scenes.sceneMap.size > 0}
  <div class="flex flex-col items-start gap-1 rounded border-2 border-slate-200 px-1 pt-2">
    <div class="flex h-6 w-full flex-row justify-center">
      <div>Scenes</div>
    </div>
    {#each slots as slot, index (slot.id)}
      {#if project.scenes.sceneMap.has(index)}
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
