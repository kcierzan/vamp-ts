import { fail, redirect } from "@sveltejs/kit";

export async function load({ locals: { supabase, getSession } }) {
  const session = await getSession();

  if (!session) {
    throw redirect(303, "/");
  }

  const { data, error } = await supabase
    .from("projects")
    .select()
    .eq("created_by_user_id", session.user.id);

  if (error) {
    return fail(500);
  }

  return { projects: data };
}
