<script lang="ts">
  import { sceneStore } from "../stores";
  import SceneButton from "./SceneButton.svelte";

  const NUMBER_OF_ROWS = 16;
  const slots = Array.from({ length: NUMBER_OF_ROWS }, (_, i) => ({
    id: i * NUMBER_OF_ROWS,
  }));
</script>

{#if $sceneStore.scenes}
  <div
    class="flex flex-col items-start gap-1 rounded border-2 border-slate-200 px-1 pt-2"
  >
    <div class="flex h-6 w-full flex-row justify-center">
      <div>Scenes</div>
    </div>
    {#each slots as slot, index (slot.id)}
      {#if Object.keys($sceneStore.scenes).includes(index.toString())}
        <div class="box-content rounded border-2 border-white">
          <SceneButton
            index={index.toString()}
            clips={$sceneStore.scenes[index.toString()]}
            state={$sceneStore.states[index.toString()]}
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
