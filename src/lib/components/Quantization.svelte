<script lang="ts">
  import { quantizationStore } from "../stores";
  import { QuantizationInterval } from "../types";

  const options = {
    [QuantizationInterval.EightBars]: "8 Bars",
    [QuantizationInterval.FourBars]: "4 Bars",
    [QuantizationInterval.TwoBars]: "2 Bars",
    [QuantizationInterval.OneBar]: "1 Bar",
    [QuantizationInterval.HalfNote]: "1/2",
    [QuantizationInterval.QuarterNote]: "1/4",
    [QuantizationInterval.EigthNote]: "1/8",
    [QuantizationInterval.SixteenthNote]: "1/16"
  };
</script>

<select class="h-8 w-36 rounded border-2 p-0 pl-2" bind:value={$quantizationStore}>
  {#each Object.entries(options) as [value, label] (value)}
    <option {value}>{label}</option>
  {/each}
</select>
