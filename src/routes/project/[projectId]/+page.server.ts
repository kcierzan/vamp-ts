import { error, fail, redirect } from "@sveltejs/kit";

export const ssr = false;

export async function load({ params, locals: { supabase } }) {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: project, error: err } = await supabase
    .from("projects")
    .select("*, tracks(*, audio_clips(*, audio_files(*)))")
    // TODO: replace with RLS
    .eq("created_by_user_id", user?.id)
    .eq("id", parseInt(params.projectId))
    .single();

  const { data: pool, error: pfError } = await supabase
    .from("projects")
    .select("audio_files(*)")
    .eq("id", parseInt(params.projectId))
    .eq("created_by_user_id", user?.id)
    .single();

  if (err || pfError) return fail(500);
  if (!project) throw error(404);

  project.audio_files = pool.audio_files;
  return { project };
}

export const actions = {
  delete: async ({ request, locals: { supabase } }) => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const formData = await request.formData();
    const formId = formData.get("projectId");
    // TODO: replace with RLS
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", formId)
      .eq("created_by_user_id", user?.id);

    if (deleteError) throw error(403);
    throw redirect(303, "/dashboard");
  }
};
