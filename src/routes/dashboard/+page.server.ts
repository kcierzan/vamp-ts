import { fail, redirect } from "@sveltejs/kit";

export async function load({ locals: { supabase } }) {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("projects")
    .select()
    // TODO: replace with RLS
    .eq("created_by_user_id", user?.id);

  if (error) {
    return fail(500);
  }

  return { projects: data };
}

export const actions = {
  create_project: async ({ locals: { supabase } }) => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name: "New project",
        // TODO: replace with RLS
        created_by_user_id: user?.id
      })
      .select()
      .single();

    if (error) {
      return fail(500);
    }

    throw redirect(303, `/project/${project.id}`);
  }
};
