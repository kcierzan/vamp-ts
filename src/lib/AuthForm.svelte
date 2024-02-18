<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "../routes/$types";

  export let action: string;
  export let form: ActionData;
  export let buttonText: string = "Log in";

  let email = form?.email ?? "";
  let password = form?.password ?? "";
  let disabled = false;

  function handleSubmit() {
    disabled = true;
    return async ({ update }: { update: () => Promise<void> }) => {
      await update();
      disabled = false;
    };
  }
</script>

<div class="justify-center w-1/3 items-center">
  {#if form?.error}
    <p class="text-center text-red-500 mb-2">{form.error}</p>
  {/if}

  <form method="post" {action} class="form-control" use:enhance={handleSubmit}>
    <div>
      <label class="label" for="email">Email</label>
      <div>
        <input
          class="input input-bordered w-full"
          id="email"
          name="email"
          type="email"
          bind:value={email}
        />
      </div>
    </div>
    <div>
      <label class="label" for="password">Password</label>
      <input
        class="input input-bordered w-full"
        id="password"
        name="password"
        type="password"
        bind:value={password}
      />
    </div>
    <div class="flex flex-row justify-center mt-6">
      <button class="btn btn-primary grow" {disabled}>{buttonText}</button>
    </div>
  </form>
</div>
