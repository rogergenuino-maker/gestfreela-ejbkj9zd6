import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { checkins } = await req.json()
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')

    const enrichedCheckins = await Promise.all(
      (checkins || []).map(async (checkin: any) => {
        let address = 'Endereço aproximado não disponível'
        
        if (apiKey && checkin.latitude && checkin.longitude) {
          try {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${checkin.latitude},${checkin.longitude}&key=${apiKey}`)
            const data = await res.json()
            if (data.results && data.results.length > 0) {
              address = data.results[0].formatted_address
            }
          } catch (e) {
            console.error('Geocoding error', e)
            address = `Lat: ${Number(checkin.latitude).toFixed(4)}, Lng: ${Number(checkin.longitude).toFixed(4)}`
          }
        } else {
          address = `Lat: ${Number(checkin.latitude).toFixed(4)}, Lng: ${Number(checkin.longitude).toFixed(4)}`
        }
        
        return { ...checkin, endereco_aproximado: address }
      })
    )

    return new Response(JSON.stringify({ 
      checkins: enrichedCheckins,
      apiKey: apiKey || null 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
