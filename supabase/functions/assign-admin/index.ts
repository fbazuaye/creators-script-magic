import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { email } = await req.json();

  // Look up user by email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 500, headers: corsHeaders });

  const user = users.find((u: any) => u.email === email);
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: corsHeaders });

  // Insert admin role
  const { error } = await supabase.from("user_roles").upsert({
    user_id: user.id,
    role: "admin",
  }, { onConflict: "user_id,role" });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

  return new Response(JSON.stringify({ success: true, user_id: user.id }), { headers: corsHeaders });
});
