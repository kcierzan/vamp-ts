import { error, fail, redirect } from "@sveltejs/kit";

export async function load({ params, locals: { supabase, getSession } }) {
  const session = await getSession();

  if (!session) throw redirect(303, "/");

  const { data, error: err } = await supabase
    .from("projects")
    .select()
    .eq("created_by_user_id", session.user.id)
    .eq("id", parseInt(params.projectId))
    .single();

  if (err) return fail(500);
  if (!data) throw error(404);

  return { project: data };
}
