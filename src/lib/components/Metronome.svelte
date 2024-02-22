<script lang="ts">
  import { onMount } from "svelte";
  import { AmplitudeEnvelope, Oscillator, Transport } from "tone";
  import { transportStore } from "../stores";

  let on = false;
  let events: number[] = [];
  let upOsc: Oscillator | undefined;
  let osc: Oscillator | undefined;
  let upEnvelope: AmplitudeEnvelope | undefined;
  let envelope: AmplitudeEnvelope | undefined;
  $: currentBeat = on ? parseInt($transportStore.barsBeatsSixteenths.split(":")[1]) + 1 : 1;

  function createOscillators() {
    upOsc = new Oscillator(880, "sine");
    osc = new Oscillator(440, "sine");
    upEnvelope = new AmplitudeEnvelope({
      attack: 0.015,
      decay: 0.2,
      sustain: 0,
      release: 0.05
    }).toDestination();
    envelope = new AmplitudeEnvelope({
      attack: 0.015,
      decay: 0.2,
      sustain: 0,
      release: 0.05
    }).toDestination();
  }

  function scheduleBeats() {
    if (!osc || !envelope || !upEnvelope || !upOsc) return;
    osc.connect(envelope).start();
    upOsc.connect(upEnvelope).start();
    const scheduled = [0, 1, 2, 3].map((beat) => {
      return Transport.scheduleRepeat(
        (time) => {
          if (beat === 0) {
            upOsc?.restart(time);
            upEnvelope?.triggerAttackRelease(0.2, time);
          } else {
            osc?.restart(time);
            envelope?.triggerAttackRelease(0.2, time);
          }
        },
        "1m",
        `0:${beat}`
      );
    });
    events = [...events, ...scheduled];
  }

  function clearEvents() {
    for (const eventId of events) {
      Transport.clear(eventId);
    }
    events = [];
  }

  async function toggle() {
    if (on) {
      clearEvents();
      on = false;
      // currentBeat = 1;
    } else {
      on = true;
      scheduleBeats();
    }
  }

  onMount(async () => createOscillators());
</script>

<button
  class="h-8 w-16 rounded bg-gray-400 text-base text-black"
  class:bg-yellow-500={on}
  on:click={toggle}>{currentBeat}</button
>
