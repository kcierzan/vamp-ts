<script lang="ts">
  import AuthForm from "$lib/AuthForm.svelte";
  export let form;
</script>

<div class="flex flex-row justify-center items-center h-screen">
  <div class="flex flex-col w-1/2 items-center">
    <h1 class="text-6xl font-bold text-center text-rose-400 mb-8">Welcome to Vamp</h1>

    <AuthForm action={"?/login"} {form} />

    <p class="text-center mt-3">
      Don't have an account? <a class="link-primary" href="/sign_up">Sign up</a>.
    </p>
  </div>
</div>
