import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Follow redirects to get the final URL
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    })

    const finalUrl = response.url

    // Extract coordinates from the final URL
    const decodedUrl = decodeURIComponent(finalUrl)

    let lon: string | null = null
    let lat: string | null = null

    // Try POI point first
    const poiMatch = decodedUrl.match(/poi\[point\]=([0-9.]+),([0-9.]+)/)
    if (poiMatch) {
      lon = poiMatch[1]
      lat = poiMatch[2]
    }

    // Try pt parameter
    if (!lon) {
      const ptMatch = decodedUrl.match(/pt=([0-9.]+),([0-9.]+)/)
      if (ptMatch) {
        lon = ptMatch[1]
        lat = ptMatch[2]
      }
    }

    // Try ll parameter
    if (!lon) {
      const llMatch = decodedUrl.match(/ll=([0-9.]+),([0-9.]+)/)
      if (llMatch) {
        lon = llMatch[1]
        lat = llMatch[2]
      }
    }

    return new Response(
      JSON.stringify({
        originalUrl: url,
        resolvedUrl: finalUrl,
        coordinates: lon && lat ? { lon, lat } : null,
        widgetUrl: lon && lat
          ? `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=17&pt=${lon},${lat},pm2rdm`
          : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
