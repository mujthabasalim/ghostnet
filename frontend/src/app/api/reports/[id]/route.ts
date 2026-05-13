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

    // Broadcast the update to EVERYONE on the platform (Public & Auth)
    if (updateData.status === 'IN_PROGRESS' || updateData.status === 'RETRIEVED') {
      const { data: net } = await supabaseAdmin
        .from('ghost_nets')
        .select('net_type, area_name')
        .eq('id', id)
        .single();

      if (net) {
        await supabase.channel('maritime-alerts').send({
          type: 'broadcast',
          event: 'new-hazard', // Using same event for simplicity in the listener
          payload: {
            title: updateData.status === 'IN_PROGRESS' ? 'Retrieval Initialized' : 'Hazard Recovered',
            message: updateData.status === 'IN_PROGRESS' 
              ? `A recovery mission has begun for the ${net.net_type} in ${net.area_name}.`
              : `The ${net.net_type} in ${net.area_name} has been successfully cleared!`,
            type: updateData.status === 'IN_PROGRESS' ? 'RETRIEVAL_START' : 'RETRIEVAL_COMPLETE'
          }
        });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
