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
        reporter:profiles!reported_by(full_name, mobile, id_code),
        retriever:profiles!retrieved_by(full_name, id_code)
      `)
      .order('reported_at', { ascending: false });

    if (error) throw error;

    const processedData = data.map((net: any) => {
      let lat = null;
      let lng = null;

      if (net.location) {
        if (typeof net.location === 'object') {
          lng = net.location.coordinates[0];
          lat = net.location.coordinates[1];
        } else if (typeof net.location === 'string') {
          // Handle WKB Hex format (PostGIS raw)
          if (net.location.length >= 50) {
            try {
              // Standard PostGIS WKB for Point (Little Endian)
              // 01 01000020 E6100000 [8 bytes Lng] [8 bytes Lat]
              const hexToDouble = (hex: string) => {
                const buffer = new ArrayBuffer(8);
                const view = new DataView(buffer);
                for (let i = 0; i < 8; i++) {
                  view.setUint8(i, parseInt(hex.substring(i * 2, i * 2 + 2), 16));
                }
                return view.getFloat64(0, true);
              };

              // Extract coordinates (skip the first 18 hex chars/9 bytes)
              lng = hexToDouble(net.location.substring(18, 34));
              lat = hexToDouble(net.location.substring(34, 50));
            } catch (e) {
              console.error('WKB parse error:', e);
            }
          }
          
          // Fallback to WKT string
          if (lat === null && net.location.startsWith('POINT')) {
            const matches = net.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
            if (matches) {
              lng = parseFloat(matches[1]);
              lat = parseFloat(matches[2]);
            }
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
