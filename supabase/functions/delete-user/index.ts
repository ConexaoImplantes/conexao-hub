import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify caller
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const callerId = claimsData.claims.sub as string

    // Check super_admin role
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: callerId, _role: 'super_admin' })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: super_admin required' }), { status: 403, headers: corsHeaders })
    }

    const { userId } = await req.json()
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), { status: 400, headers: corsHeaders })
    }

    // Prevent self-deletion
    if (userId === callerId) {
      return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), { status: 400, headers: corsHeaders })
    }

    // Use service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Delete user_roles
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId)

    // Delete profiles
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // Delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
