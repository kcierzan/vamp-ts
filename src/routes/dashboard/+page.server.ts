import { fail, redirect } from "@sveltejs/kit";

export async function load({ locals: { supabase, session } }) {
  const { data, error } = await supabase
    .from("projects")
    .select()
    .eq("created_by_user_id", session?.user.id);

  if (error) {
    return fail(500);
  }

  return { projects: data };
}

export const actions = {
  create_project: async ({ locals: { supabase, session } }) => {
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        name: "New project",
        created_by_user_id: session?.user.id
      })
      .select()
      .single();

    if (error) {
      return fail(500);
    }

    throw redirect(303, `/project/${project.id}`);
  }
};
