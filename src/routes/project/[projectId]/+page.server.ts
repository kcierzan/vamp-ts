import { redirect } from "@sveltejs/kit";
import { error, fail } from "@sveltejs/kit";

export async function load({ params, locals: { supabase, session } }) {
  const { data, error: err } = await supabase
    .from("projects")
    .select("*, tracks(*, audio_clips(*, audio_files(*)))")
    .eq("created_by_user_id", session?.user.id)
    .eq("id", parseInt(params.projectId))
    .single();

  if (err) return fail(500);
  if (!data) throw error(404);

  return { project: data };
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
