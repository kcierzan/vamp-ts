<script lang="ts">
  import selectedStore from "../stores/selected";

  let bars: number = 1;
  let currentBar: number = 1;
  let trigs: Note[] = [];

  let trigSlots = new Array(16).fill({
    id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    enabled: false
  });

  interface Note {
    bar: number;
    start: number;
    end: number;
  }

  function createUpdateSlotHandler(slot: { id: number; enabled: boolean }, index: number) {
    return function () {
      trigSlots.splice(index, 1, { ...slot, enabled: true });
      trigSlots = trigSlots;
    };
  }
</script>

<section>
  <input bind:value={bars} type="number" min="1" max="8" step="1" />
  <div class="flex flex-row gap-x-1">
    {#each trigSlots as slot, index}
      <button
        class="placeholder h-8 w-8 {slot.enabled ? 'bg-green-500' : 'bg-slate-200'}"
        on:click={createUpdateSlotHandler(slot, index)}
      />
    {/each}
  </div>
</section>
