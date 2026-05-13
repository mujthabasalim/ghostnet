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
    const body = await req.json();
    
    // Construct safe update object
    const updateData: any = {
      status: body.status,
    };

    if (body.status === 'RETRIEVED') {
      updateData.retrieved_at = new Date().toISOString();
      updateData.retrieved_by = user.id;
      
      if (body.retrieval_image_url) {
        updateData.retrieval_image_url = body.retrieval_image_url;
      }

      // If you want to store notes about the retrieval location
      if (body.retrieval_lat && body.retrieval_lng) {
        updateData.notes = `Retrieved at: ${body.retrieval_lat}, ${body.retrieval_lng}. ${body.notes || ''}`;
      }
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
