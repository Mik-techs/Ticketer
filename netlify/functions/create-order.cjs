const crypto = require('crypto');

exports.handler = async function(event, context) {
  // CORS
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*' }, body: '' };

  try {
    const payload = JSON.parse(event.body || '{}');
    const order = payload.order;
    if (!order) return { statusCode: 400, body: JSON.stringify({ error: 'Order required' }) };

    const storageUrl = process.env.JSON_STORAGE_URL;
    if (!storageUrl) return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured (JSON_STORAGE_URL missing)' }) };

    // fetch existing blob
    let store = {};
    try {
      const g = await fetch(storageUrl);
      if (g.ok) store = await g.json();
    } catch (e) { console.warn('could not GET storage', e); }

    // ensure object
    if (!store || typeof store !== 'object') store = {};

    // generate id
    const id = crypto.randomBytes(6).toString('hex');
    const now = Date.now();
    const entry = Object.assign({ id, createdAt: now, status: 'pending' }, order);

    store[id] = entry;

    // PUT back
    const put = await fetch(storageUrl, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(store) });
    if (!put.ok) {
      const text = await put.text();
      console.error('put failed', put.status, text);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save order' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ id }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
