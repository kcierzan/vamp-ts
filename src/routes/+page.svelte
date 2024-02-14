<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte";
  import { ThemeSupa } from "@supabase/auth-ui-shared";

  export let data;
</script>

<div class="flex flex-row justify-center items-center h-screen">
  <div class="flex flex-col w-1/3">
    <h1 class="text-3xl bold text-center">Welcome to Vamp</h1>
    <Auth
      supabaseClient={data.supabase}
      view="magic_link"
      redirectTo={`${data.url}/auth/callback`}
      showLinks={false}
      appearance={{ theme: ThemeSupa, style: { input: "color: #222" } }}
    />
  </div>
</div>
