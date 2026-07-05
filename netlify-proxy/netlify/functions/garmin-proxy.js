const https = require('https');

exports.handler = async function(event, context) {
  const BASE_URL = 'https://share.garmin.com/Feed/Share/9G2GF';

  // Forward d1/d2 date params if provided
  const params = event.queryStringParameters || {};
  const query = Object.keys(params).length
    ? '?' + Object.entries(params).map(([k,v]) => k + '=' + encodeURIComponent(v)).join('&')
    : '';
  const url = BASE_URL + query;

  try {
    const kml = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: { 'User-Agent': 'Netlify-GarminProxy/1.0' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=120',
      },
      body: kml,
    };

  } catch (err) {
    return {
      statusCode: 502,
      body: `<error>Could not fetch Garmin feed: ${err.message}</error>`,
    };
  }
};
