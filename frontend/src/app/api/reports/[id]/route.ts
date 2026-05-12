import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth-utils';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: You must be signed in to perform this operation.' }, { status: 401 });
    }

    const { id } = await params;
    const updateData = await req.json();
    
    if (updateData.status === 'RETRIEVED') {
      updateData.retrieved_at = new Date().toISOString();
      updateData.retrieved_by = user.id;
    }

    const { data, error } = await supabaseAdmin
      .from('ghost_nets')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
