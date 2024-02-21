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
