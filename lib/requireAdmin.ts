import { supabase } from "@/lib/supabaseClient";
import { isAdminEmail } from "@/lib/admin";

export async function requireAdminOrThrow() {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  const email = data.user?.email ?? null;
  if (!isAdminEmail(email)) {
    throw new Error("Not authorized as admin");
  }

  return { user: data.user };
}