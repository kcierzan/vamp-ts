import { error, fail, redirect } from "@sveltejs/kit";

export async function load({ params, locals: { supabase, session } }) {
  const { data: project, error: err } = await supabase
    .from("projects")
    .select("*, tracks(*, audio_clips(*, audio_files(*)))")
    .eq("created_by_user_id", session?.user.id)
    .eq("id", parseInt(params.projectId))
    .single();

  const { data: pool, error: pfError } = await supabase
    .from("projects")
    .select("audio_files(*)")
    .eq("id", parseInt(params.projectId))
    .single();

  if (err || pfError) return fail(500);
  if (!project) throw error(404);

  return { project, pool_files: pool.audio_files };
}

export const actions = {
  delete: async ({ request, locals: { supabase, session } }) => {
    const formData = await request.formData();
    const formId = formData.get("projectId");
    const { data: project, error: err } = await supabase
      .from("projects")
      .select("id")
      .eq("id", formId)
      .eq("created_by_user_id", session?.user.id)
      .single();

    if (err) throw error(403);

    const { error: deleteError } = await supabase.from("projects").delete().eq("id", project.id);

    if (deleteError) return fail(500);
    throw redirect(303, "/dashboard");
  }
};
