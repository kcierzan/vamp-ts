import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ locals: { supabase, session } }) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select(`username, full_name, website, avatar_url`)
    .eq("id", session?.user.id)
    .single();

  return { session, profile };
};

export const actions = {
  update: async ({ request, locals: { supabase, session } }) => {
    const formData = await request.formData();
    const fullName = formData.get("fullName");
    const username = formData.get("username");
    const website = formData.get("website");
    const avatarUrl = formData.get("url");

    const { error } = await supabase.from("profiles").upsert({
      id: session?.user.id,
      full_name: fullName,
      username,
      website,
      avatar_url: avatarUrl,
      updated_at: new Date()
    });

    if (error) {
      return fail(500, {
        fullName,
        username,
        website,
        avatarUrl
      });
    }

    return {
      fullName,
      username,
      website,
      avatarUrl
    };
  },
  sign_out: async ({ locals: { supabase, session } }) => {
    if (session) {
      await supabase.auth.signOut();
      throw redirect(303, "/");
    }
  }
};
