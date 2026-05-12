import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUser } from '@/lib/auth-utils';

export async function GET() {
  try {
    // Select lat/lng from the geography location column using raw fragment or standard select
    // In PostGIS geography, we can use st_asgeojson or just cast to geometry
    const { data, error } = await supabase
      .from('ghost_nets')
      .select(`
        *,
        lat:location,
        lng:location,
        reporter:profiles!reported_by(full_name, mobile, id_code)
      `)
      .order('reported_at', { ascending: false });

    if (error) throw error;

    // Process the location data to extract lat/lng for the frontend if needed
    // Supabase returns geography as a GeoJSON string or object depending on configuration
    const processedData = data.map((net: any) => {
      let lat = net.lat;
      let lng = net.lng;

      // Handle PostGIS geography objects/strings
      if (net.location) {
        if (typeof net.location === 'object' && net.location.coordinates) {
          lng = net.location.coordinates[0];
          lat = net.location.coordinates[1];
        } else if (typeof net.location === 'string' && net.location.startsWith('POINT')) {
          const coords = net.location.match(/\((.*)\)/)?.[1].split(' ');
          if (coords) {
            lng = parseFloat(coords[0]);
            lat = parseFloat(coords[1]);
          }
        }
      }

      return {
        ...net,
        lat: lat,
        lng: lng
      };
    });
    
    return NextResponse.json(processedData);
  } catch (error: any) {
    console.error('API GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: You must be signed in to report a hazard.' }, { status: 401 });
    }

    const reportData = await req.json();
    
    const { data, error } = await supabaseAdmin
      .from('ghost_nets')
      .insert([
        {
          net_type: reportData.netType,
          length: parseFloat(reportData.length),
          color: reportData.color,
          float_color: reportData.floatColor,
          float_desc: reportData.floatDesc,
          area_name: reportData.areaName,
          depth: parseFloat(reportData.depth),
          weather: reportData.weather,
          notes: reportData.notes,
          // Store as PostGIS geography point (lng lat)
          location: `POINT(${reportData.lng} ${reportData.lat})`,
          status: 'ACTIVE',
          image_url: reportData.imageUrl,
          reported_by: user.id,
          is_dev_report: reportData.isDevReport || false
        }
      ])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
