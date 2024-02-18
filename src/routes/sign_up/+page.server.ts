import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ url, locals: { getSession } }) => {
  const session = await getSession();

  if (session) {
    throw redirect(303, "/account");
  }

  return { url: url.origin };
};

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  let baseUrl = `${url.protocol}//${url.hostname}`;
  if (url.port) {
    baseUrl += `:${url.port}`;
  }
  return baseUrl;
}

export const actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      // TODO: should redirect to a success page
      options: { emailRedirectTo: `${getBaseUrl(request)}/account` }
    });

    if (error) {
      return fail(error.status ?? 401, { email, password, error: error.message });
    }

    throw redirect(303, "/account");
  }
};
