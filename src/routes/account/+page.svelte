<script lang="ts">
  import { enhance } from "$app/forms";

  export let data;
  export let form;
  let { session, profile } = data;
  $: ({ session, profile } = data);

  let loading = false;
  let fullName = profile?.full_name ?? "";
  let username = profile?.username ?? "";

  function handleSubmit() {
    loading = true;
    return async () => {
      loading = false;
    };
  }

  function handleSignOut() {
    loading = true;
    return async ({ update }: { update: () => void }) => {
      loading = false;
      update();
    };
  }
</script>

<div>
  <form action="?/update" method="post" use:enhance={handleSubmit} >
    <div>
      <label for="email">Email</label>
      <input id="email" type="email" value={session.user.email} disabled />
    </div>
    <div>
      <label for="fullName">Full Name</label>
      <input id="fullName" name="fullName" type="text" value={form?.fullName ?? fullName} />
    </div>
    <div>
      <label for="username">Username</label>
      <input id="username" name="username" type="text" value={form?.username ?? username} />
    </div>
    <div>
      <input type="submit" value={loading ? "Loading..." : "Update"} disabled={loading} />
    </div>
  </form>

  <form method="post" action="?/sign_out" use:enhance={handleSignOut}>
    <div>
      <button disabled={loading}>Sign out</button>
    </div>
  </form>
</div>
