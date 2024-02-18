<script lang="ts">
  import AuthForm from "$lib/AuthForm.svelte";

  export let form;
</script>

<div class="flex flex-row justify-center items-center h-screen">
  <div class="flex flex-col w-1/2 items-center">
    <h1 class="text-6xl font-bold text-center text-rose-400 mb-8">Get started with Vamp</h1>

    <AuthForm action={"?/signup"} {form} buttonText={"Sign up"} />

    <p class="text-center mt-3">
      Already have an account? <a class="link-primary" href="/">Log in</a>.
    </p>
  </div>
</div>
