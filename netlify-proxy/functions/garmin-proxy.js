export async function onRequest(context) {
  const BASE_URL = 'https://share.garmin.com/Feed/Share/9G2GF';

  // Forward d1/d2 date params if provided
  const url = new URL(context.request.url);
  const d1 = url.searchParams.get('d1');
  const d2 = url.searchParams.get('d2');

  let garminUrl = BASE_URL;
  if (d1 || d2) {
    const params = new URLSearchParams();
    if (d1) params.set('d1', d1);
    if (d2) params.set('d2', d2);
    garminUrl = BASE_URL + '?' + params.toString();
  }

  try {
    const response = await fetch(garminUrl, {
      headers: { 'User-Agent': 'CloudflarePages-GarminProxy/1.0' }
    });

    const kml = await response.text();

    return new Response(kml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=120',
      }
    });

  } catch (err) {
    return new Response(`<error>Could not fetch Garmin feed: ${err.message}</error>`, {
      status: 502,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
