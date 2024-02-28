<svelte:options immutable />

<script lang="ts">
  import { getContext } from "svelte";
  import trackMessage from "../messages/track";
  import type { ProjectContext } from "../types";

  const { project, supabase } = getContext<ProjectContext>("project");
</script>

<button class="add-track" on:click={() => trackMessage.createEmpty(supabase, project.id)}>
  <span class="self-center">Add track</span>
</button>

<style lang="postcss">
  .add-track {
    @apply flex h-8 w-36 justify-center rounded bg-green-500 p-1 text-lg text-white hover:bg-green-700;
  }
</style>
