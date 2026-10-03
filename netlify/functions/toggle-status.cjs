exports.handler = async function(event, context) {
  try {
    const token = event.headers['x-admin-token'];
    if (!token || token !== process.env.ADMIN_TOKEN) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };

    const body = JSON.parse(event.body || '{}');
    const id = body.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'id required' }) };

    const storageUrl = process.env.JSON_STORAGE_URL;
    if (!storageUrl) return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };

    // get current
    const g = await fetch(storageUrl);
    if (!g.ok) return { statusCode: 500, body: JSON.stringify({ error: 'Failed to read storage' }) };
    const store = await g.json();
    if (!store[id]) return { statusCode: 404, body: JSON.stringify({ error: 'not found' }) };

    store[id].status = store[id].status === 'completed' ? 'pending' : 'completed';

    const put = await fetch(storageUrl, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(store) });
    if (!put.ok) return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update storage' }) };

    return { statusCode: 200, body: JSON.stringify({ order: store[id] }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
