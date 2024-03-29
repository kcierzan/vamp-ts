import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ url, locals: { session } }) => {
  if (session) {
    throw redirect(303, "/dashboard");
  }

  return { url: url.origin };
};

export const actions = {
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return fail(error.status ?? 400, { email, password, error: error.message });
    }

    throw redirect(303, "/dashboard");
  }
};
