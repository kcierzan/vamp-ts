<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte";
  import { ThemeSupa } from "@supabase/auth-ui-shared";

  export let data;
</script>

<div class="flex flex-row justify-center items-center h-screen">
  <div class="flex flex-col w-1/3">
    <h1 class="text-6xl font-bold text-center text-rose-400 mb-10">Welcome to Vamp</h1>

    <Auth
      supabaseClient={data.supabase}
      view="magic_link"
      redirectTo={`${data.url}/auth/callback`}
      showLinks={false}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: { brand: "rgb(251 113 133)", brandAccent: "rgb(159 18 57)" }
          }
        }
      }}
    />
  </div>
</div>
