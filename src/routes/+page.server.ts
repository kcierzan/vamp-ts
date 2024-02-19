import { fail, redirect } from "@sveltejs/kit";

export async function load({ url, locals: { getSession } }) {
  const session = await getSession();

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
      return fail(error.status ?? 401, { email, password, error: error.message });
    }

    throw redirect(303, "/dashboard");
  }
};
